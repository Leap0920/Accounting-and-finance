<?php
/**
 * Transaction Data API
 * Handles database queries for transaction recording module
 * 
 * Database Tables Used (from schema.sql):
 * - journal_entries: Main transaction records
 * - journal_lines: Individual debit/credit lines
 * - journal_types: Transaction types (GJ, CR, CD, etc.)
 * - accounts: Chart of accounts
 * - users: User information
 * - audit_logs: Audit trail tracking
 */

require_once '../../config/database.php';
require_once '../../includes/session.php';

header('Content-Type: application/json');

// Verify user is logged in
requireLogin();

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_transactions':
            getTransactions();
            break;
        
        case 'get_transaction_details':
            getTransactionDetails();
            break;
        
        case 'get_audit_trail':
            getAuditTrail();
            break;
        
        case 'get_statistics':
            getStatistics();
            break;
        
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Get transactions with optional filters
 * 
 * Query from schema tables:
 * - journal_entries
 * - journal_types
 * - users
 * - fiscal_periods
 */
function getTransactions() {
    global $conn;
    
    // Get filter parameters
    $dateFrom = $_GET['date_from'] ?? '';
    $dateTo = $_GET['date_to'] ?? '';
    $type = $_GET['type'] ?? '';
    $status = $_GET['status'] ?? '';
    $account = $_GET['account'] ?? '';
    
    // Base query using schema tables
    $sql = "SELECT 
                je.id,
                je.journal_no,
                je.entry_date,
                jt.code as type_code,
                jt.name as type_name,
                je.description,
                je.reference_no,
                je.total_debit,
                je.total_credit,
                je.status,
                u.username as created_by,
                u.full_name as created_by_name,
                je.created_at,
                je.posted_at,
                fp.period_name as fiscal_period
            FROM journal_entries je
            INNER JOIN journal_types jt ON je.journal_type_id = jt.id
            INNER JOIN users u ON je.created_by = u.id
            LEFT JOIN fiscal_periods fp ON je.fiscal_period_id = fp.id
            WHERE 1=1";
    
    $params = [];
    $types = '';
    
    // Apply filters
    if (!empty($dateFrom)) {
        $sql .= " AND je.entry_date >= ?";
        $params[] = $dateFrom;
        $types .= 's';
    }
    
    if (!empty($dateTo)) {
        $sql .= " AND je.entry_date <= ?";
        $params[] = $dateTo;
        $types .= 's';
    }
    
    if (!empty($type)) {
        $sql .= " AND jt.code = ?";
        $params[] = $type;
        $types .= 's';
    }
    
    if (!empty($status)) {
        $sql .= " AND je.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    // Filter by account number (join with journal_lines and accounts)
    if (!empty($account)) {
        $sql .= " AND EXISTS (
            SELECT 1 FROM journal_lines jl
            INNER JOIN accounts a ON jl.account_id = a.id
            WHERE jl.journal_entry_id = je.id AND a.code LIKE ?
        )";
        $params[] = "%{$account}%";
        $types .= 's';
    }
    
    $sql .= " ORDER BY je.entry_date DESC, je.journal_no DESC";
    
    // Prepare and execute
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $transactions = [];
    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $transactions,
        'count' => count($transactions)
    ]);
}

/**
 * Get detailed information for a specific transaction
 * Including all journal lines
 */
function getTransactionDetails() {
    global $conn;
    
    $transactionId = $_GET['id'] ?? '';
    
    if (empty($transactionId)) {
        throw new Exception('Transaction ID is required');
    }
    
    // Get main transaction data
    $sql = "SELECT 
                je.*,
                jt.code as type_code,
                jt.name as type_name,
                u.username as created_by,
                u.full_name as created_by_name,
                fp.period_name as fiscal_period,
                pu.username as posted_by,
                pu.full_name as posted_by_name
            FROM journal_entries je
            INNER JOIN journal_types jt ON je.journal_type_id = jt.id
            INNER JOIN users u ON je.created_by = u.id
            LEFT JOIN fiscal_periods fp ON je.fiscal_period_id = fp.id
            LEFT JOIN users pu ON je.posted_by = pu.id
            WHERE je.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $transactionId);
    $stmt->execute();
    $result = $stmt->get_result();
    $transaction = $result->fetch_assoc();
    
    if (!$transaction) {
        throw new Exception('Transaction not found');
    }
    
    // Get journal lines
    $sql = "SELECT 
                jl.*,
                a.code as account_code,
                a.name as account_name,
                at.category as account_category
            FROM journal_lines jl
            INNER JOIN accounts a ON jl.account_id = a.id
            INNER JOIN account_types at ON a.type_id = at.id
            WHERE jl.journal_entry_id = ?
            ORDER BY jl.id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $transactionId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $lines = [];
    while ($row = $result->fetch_assoc()) {
        $lines[] = $row;
    }
    
    $transaction['lines'] = $lines;
    
    echo json_encode([
        'success' => true,
        'data' => $transaction
    ]);
}

/**
 * Get audit trail for transactions
 * Uses audit_logs table from schema
 */
function getAuditTrail() {
    global $conn;
    
    $transactionId = $_GET['id'] ?? '';
    
    $sql = "SELECT 
                al.*,
                u.username,
                u.full_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.object_type = 'journal_entry'";
    
    $params = [];
    $types = '';
    
    if (!empty($transactionId)) {
        $sql .= " AND al.object_id = ?";
        $params[] = $transactionId;
        $types .= 's';
    }
    
    $sql .= " ORDER BY al.created_at DESC LIMIT 100";
    
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $logs
    ]);
}

/**
 * Get transaction statistics for dashboard cards
 */
function getStatistics() {
    global $conn;
    
    $sql = "SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted_count,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
                SUM(CASE WHEN DATE(entry_date) = CURDATE() THEN 1 ELSE 0 END) as today_count,
                SUM(total_debit) as total_debit,
                SUM(total_credit) as total_credit
            FROM journal_entries";
    
    $result = $conn->query($sql);
    $stats = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
}

/**
 * Export transactions to Excel
 * Note: Requires PHPSpreadsheet library
 */
function exportToExcel() {
    // This would require PHPSpreadsheet library
    // Implementation example:
    /*
    require_once '../../vendor/autoload.php';
    
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // Add headers
    $sheet->setCellValue('A1', 'Journal No');
    $sheet->setCellValue('B1', 'Date');
    // ... etc
    
    // Get data and populate
    // ...
    
    $writer = new Xlsx($spreadsheet);
    
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="transactions.xlsx"');
    header('Cache-Control: max-age=0');
    
    $writer->save('php://output');
    */
    
    throw new Exception('Excel export requires PHPSpreadsheet library to be installed');
}
?>

