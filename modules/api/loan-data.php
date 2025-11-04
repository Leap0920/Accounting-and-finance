<?php
/**
 * Loan Data API
 * Handles database queries for loan accounting module
 * 
 * Database Tables Used:
 * - loans: Main loan records
 * - loan_types: Types of loans
 * - loan_payments: Payment history
 * - accounts: Chart of accounts
 * - users: User information
 * - audit_logs: Audit trail tracking
 */

// Start output buffering to prevent any HTML output
ob_start();

// Disable error display to prevent HTML error pages
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set error handler to catch any errors
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    require_once dirname(__DIR__, 2) . '/config/database.php';
    require_once dirname(__DIR__, 2) . '/includes/session.php';
} catch (Exception $e) {
    // Clear any output and return JSON error
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'System error: ' . $e->getMessage()
    ]);
    exit();
}

// Verify user is logged in
if (!isLoggedIn()) {
    // Clear any output and return JSON error
    ob_clean();
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required'
    ]);
    exit();
}

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_loans':
            getLoans();
            break;
        
        case 'get_loan_details':
            getLoanDetails();
            break;
        
        case 'get_audit_trail':
            getAuditTrail();
            break;
        
        case 'get_statistics':
            getStatistics();
            break;
        
        case 'soft_delete_loan':
            softDeleteLoan();
            break;
        
        case 'restore_loan':
            restoreLoan();
            break;
        
        case 'get_bin_items':
            getBinItems();
            break;
        
        case 'permanent_delete_loan':
            permanentDeleteLoan();
            break;
        
        case 'export_excel':
            exportToExcel();
            break;
        
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    // Clear any output and return JSON error
    ob_clean();
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    ob_end_flush();
    exit();
}

/**
 * Get loans with optional filters
 */
function getLoans() {
    global $conn;
    
    // Get filter parameters
    $dateFrom = $_GET['date_from'] ?? '';
    $dateTo = $_GET['date_to'] ?? '';
    $transactionType = $_GET['transaction_type'] ?? '';
    $status = $_GET['status'] ?? '';
    $accountNumber = $_GET['account_number'] ?? '';
    
    // Base query - matching actual schema columns
    $sql = "SELECT 
                l.id,
                l.loan_no as loan_number,
                l.borrower_external_no as borrower_name,
                l.principal_amount as loan_amount,
                l.interest_rate,
                l.term_months as loan_term,
                l.start_date,
                DATE_ADD(l.start_date, INTERVAL l.term_months MONTH) as maturity_date,
                l.current_balance as outstanding_balance,
                l.status,
                'loan' as transaction_type,
                lt.name as loan_type_name,
                '' as account_code,
                '' as account_name,
                l.created_at,
                u.full_name as created_by_name
            FROM loans l
            LEFT JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE 1=1";
    
    $params = [];
    $types = '';
    
    // Apply filters
    if (!empty($dateFrom)) {
        $sql .= " AND l.start_date >= ?";
        $params[] = $dateFrom;
        $types .= 's';
    }
    
    if (!empty($dateTo)) {
        $sql .= " AND l.start_date <= ?";
        $params[] = $dateTo;
        $types .= 's';
    }
    
    if (!empty($status)) {
        $sql .= " AND l.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    if (!empty($accountNumber)) {
        $sql .= " AND l.loan_no LIKE ?";
        $searchTerm = "%{$accountNumber}%";
        $params[] = $searchTerm;
        $types .= 's';
    }
    
    $sql .= " ORDER BY l.start_date DESC, l.loan_no DESC";
    
    // Prepare and execute
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $loans = [];
    while ($row = $result->fetch_assoc()) {
        $loans[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $loans,
        'count' => count($loans)
    ]);
    
    ob_end_flush();
    exit();
}

/**
 * Get detailed information for a specific loan
 * Including payment schedule and transaction history
 */
function getLoanDetails() {
    global $conn;
    
    $loanId = $_GET['id'] ?? '';
    
    if (empty($loanId)) {
        throw new Exception('Loan ID is required');
    }
    
    // Get main loan data
    $sql = "SELECT 
                l.*,
                l.loan_no as loan_number,
                l.borrower_external_no as borrower_name,
                l.principal_amount as loan_amount,
                l.term_months as loan_term,
                DATE_ADD(l.start_date, INTERVAL l.term_months MONTH) as maturity_date,
                l.current_balance as outstanding_balance,
                lt.name as loan_type_name,
                lt.description as loan_type_description,
                '' as account_code,
                '' as account_name,
                u.username as created_by_username,
                u.full_name as created_by_name
            FROM loans l
            LEFT JOIN loan_types lt ON l.loan_type_id = lt.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE l.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $loanId);
    $stmt->execute();
    $result = $stmt->get_result();
    $loan = $result->fetch_assoc();
    
    if (!$loan) {
        throw new Exception('Loan not found');
    }
    
    // Get payment schedule if table exists
    if (tableExists('loan_payments')) {
        $sql = "SELECT 
                    lp.*
                FROM loan_payments lp
                WHERE lp.loan_id = ?
                ORDER BY lp.due_date ASC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $loanId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $paymentSchedule = [];
        while ($row = $result->fetch_assoc()) {
            $paymentSchedule[] = $row;
        }
        
        $loan['payment_schedule'] = $paymentSchedule;
    }
    
    // Get transaction history if table exists
    if (tableExists('loan_transactions')) {
        $sql = "SELECT 
                    lt.*,
                    u.full_name as processed_by_name
                FROM loan_transactions lt
                LEFT JOIN users u ON lt.processed_by = u.id
                WHERE lt.loan_id = ?
                ORDER BY lt.transaction_date DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $loanId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $transactions = [];
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
        
        $loan['transactions'] = $transactions;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $loan
    ]);
    
    ob_end_flush();
    exit();
}

/**
 * Get audit trail for loans
 * Uses audit_logs table
 */
function getAuditTrail() {
    global $conn;
    
    $loanId = $_GET['id'] ?? '';
    
    $sql = "SELECT 
                al.*,
                u.username,
                u.full_name,
                l.loan_no as loan_number
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            LEFT JOIN loans l ON CAST(al.object_id AS UNSIGNED) = l.id
            WHERE al.object_type = 'loan'";
    
    $params = [];
    $types = '';
    
    if (!empty($loanId)) {
        $sql .= " AND al.object_id = ?";
        $params[] = $loanId;
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
    
    ob_end_flush();
    exit();
}

/**
 * Get loan statistics for dashboard cards
 */
function getStatistics() {
    global $conn;
    
    $sql = "SELECT 
                COUNT(*) as total_loans,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_loans,
                SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
                SUM(principal_amount) as total_amount,
                SUM(current_balance) as total_outstanding
            FROM loans";
    
    $result = $conn->query($sql);
    $stats = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
    ob_end_flush();
    exit();
}

/**
 * Soft delete loan (move to bin)
 * Updates loans table to mark as deleted
 */
function softDeleteLoan() {
    global $conn;
    
    $loanId = $_POST['loan_id'] ?? '';
    $currentUser = getCurrentUser();
    
    if (empty($loanId)) {
        throw new Exception('Loan ID is required');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Since schema doesn't have deleted_at column, we'll change status to 'cancelled'
        $sql = "UPDATE loans 
                SET status = 'cancelled'
                WHERE id = ? AND status != 'cancelled'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $loanId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('Loan not found or already deleted');
        }
        
        // Log the deletion in audit trail
        if (tableExists('audit_logs')) {
            $auditSql = "INSERT INTO audit_logs (user_id, action, object_type, object_id, additional_info, ip_address, created_at) 
                         VALUES (?, 'DELETE', 'loan', ?, 'Loan moved to bin', ?, NOW())";
            
            $auditStmt = $conn->prepare($auditSql);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $auditStmt->bind_param('iis', $currentUser['id'], $loanId, $ipAddress);
            $auditStmt->execute();
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Loan moved to bin successfully'
        ]);
        
        ob_end_flush();
        exit();
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * Restore loan from bin
 */
function restoreLoan() {
    global $conn;
    
    $loanId = $_POST['loan_id'] ?? '';
    $currentUser = getCurrentUser();
    
    if (empty($loanId)) {
        throw new Exception('Loan ID is required');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Restore loan by changing status back to active
        $sql = "UPDATE loans 
                SET status = 'active'
                WHERE id = ? AND status = 'cancelled'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $loanId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception('Loan not found or not in bin');
        }
        
        // Log the restoration in audit trail
        if (tableExists('audit_logs')) {
            $auditSql = "INSERT INTO audit_logs (user_id, action, object_type, object_id, additional_info, ip_address, created_at) 
                         VALUES (?, 'RESTORE', 'loan', ?, 'Loan restored from bin', ?, NOW())";
            
            $auditStmt = $conn->prepare($auditSql);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $auditStmt->bind_param('iis', $currentUser['id'], $loanId, $ipAddress);
            $auditStmt->execute();
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Loan restored successfully'
        ]);
        
        ob_end_flush();
        exit();
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * Get all deleted loans (bin items)
 */
function getBinItems() {
    global $conn;
    
    $sql = "SELECT 
                l.id,
                l.loan_no as loan_number,
                l.borrower_external_no as borrower_name,
                l.principal_amount as loan_amount,
                l.current_balance as outstanding_balance,
                l.start_date,
                DATE_ADD(l.start_date, INTERVAL l.term_months MONTH) as maturity_date,
                l.updated_at as deleted_at,
                lt.name as loan_type_name,
                '' as deleted_by_username,
                '' as deleted_by_name,
                'loan' as item_type
            FROM loans l
            LEFT JOIN loan_types lt ON l.loan_type_id = lt.id
            WHERE l.status = 'cancelled'
            ORDER BY l.updated_at DESC";
    
    $result = $conn->query($sql);
    
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $items
    ]);
    
    ob_end_flush();
    exit();
}

/**
 * Permanently delete loan (hard delete)
 */
function permanentDeleteLoan() {
    global $conn;
    
    $loanId = $_POST['loan_id'] ?? '';
    $currentUser = getCurrentUser();
    
    if (empty($loanId)) {
        throw new Exception('Loan ID is required');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Log the permanent deletion in audit trail first
        if (tableExists('audit_logs')) {
            $auditSql = "INSERT INTO audit_logs (user_id, action, object_type, object_id, additional_info, ip_address, created_at) 
                         VALUES (?, 'PERMANENT_DELETE', 'loan', ?, 'Loan permanently deleted from bin', ?, NOW())";
            
            $auditStmt = $conn->prepare($auditSql);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $auditStmt->bind_param('iis', $currentUser['id'], $loanId, $ipAddress);
            $auditStmt->execute();
        }
        
        // Delete related records first (foreign key constraints)
        if (tableExists('loan_payments')) {
            $deletePaymentsSql = "DELETE FROM loan_payments WHERE loan_id = ?";
            $deletePaymentsStmt = $conn->prepare($deletePaymentsSql);
            $deletePaymentsStmt->bind_param('i', $loanId);
            $deletePaymentsStmt->execute();
        }
        
        if (tableExists('loan_transactions')) {
            $deleteTransSql = "DELETE FROM loan_transactions WHERE loan_id = ?";
            $deleteTransStmt = $conn->prepare($deleteTransSql);
            $deleteTransStmt->bind_param('i', $loanId);
            $deleteTransStmt->execute();
        }
        
        // Delete the loan (only if cancelled)
        $deleteLoanSql = "DELETE FROM loans WHERE id = ? AND status = 'cancelled'";
        $deleteLoanStmt = $conn->prepare($deleteLoanSql);
        $deleteLoanStmt->bind_param('i', $loanId);
        $deleteLoanStmt->execute();
        
        if ($deleteLoanStmt->affected_rows === 0) {
            throw new Exception('Loan not found or not in bin');
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Loan permanently deleted'
        ]);
        
        ob_end_flush();
        exit();
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * Export loans to Excel
 */
function exportToExcel() {
    // This would require PHPSpreadsheet library
    // For now, return a message
    throw new Exception('Excel export requires PHPSpreadsheet library to be installed');
}

/**
 * Check if a table exists
 */
function tableExists($tableName) {
    global $conn;
    
    $result = $conn->query("SHOW TABLES LIKE '$tableName'");
    return $result && $result->num_rows > 0;
}

