<?php
require_once '../../config/database.php';
require_once '../../includes/session.php';

requireLogin();

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_statistics':
            getStatistics();
            break;
        case 'get_summary':
            getSummaryData();
            break;
        case 'get_chart_data':
            getChartData();
            break;
        case 'get_recent_transactions':
            getRecentTransactions();
            break;
        case 'get_accounts':
            getAccounts();
            break;
        case 'get_transactions':
            getTransactions();
            break;
        case 'get_audit_trail':
            getAuditTrail();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

//========================================
// GET STATISTICS
// ========================================

function getStatistics() {
    global $conn;
    
    // Count accounts
    $accountCount = $conn->query("SELECT COUNT(*) as count FROM accounts WHERE is_active = 1")->fetch_assoc();
    
    // Count transactions
    $transactionCount = $conn->query("SELECT COUNT(*) as count FROM journal_entries WHERE status = 'posted'")->fetch_assoc();
    
    // Count audit entries
    $auditCount = $conn->query("SELECT COUNT(*) as count FROM audit_logs WHERE object_type IN ('journal_entry', 'account', 'fiscal_period')")->fetch_assoc();
    
    // Count adjustments (adjusting journal entries)
    $adjustmentCount = $conn->query("SELECT COUNT(*) as count FROM journal_entries WHERE journal_type_id = (SELECT id FROM journal_types WHERE code = 'AJ' LIMIT 1)")->fetch_assoc();
    
    $data = [
        'total_accounts' => intval($accountCount['count']),
        'total_transactions' => intval($transactionCount['count']),
        'total_audit' => intval($auditCount['count']),
        'total_adjustments' => intval($adjustmentCount['count'])
    ];
    
    echo json_encode(['success' => true, 'data' => $data]);
}

//========================================
// GET SUMMARY DATA
// ========================================

function getSummaryData() {
    global $conn;
    
    // Get latest fiscal period
    $periodQuery = "SELECT id FROM fiscal_periods WHERE status = 'open' ORDER BY start_date DESC LIMIT 1";
    $periodResult = $conn->query($periodQuery);
    $period = $periodResult->fetch_assoc();
    $periodId = $period['id'] ?? 1;
    
    // Get Assets
    $assetQuery = "SELECT 
                    SUM(ab.closing_balance) as total,
                    COUNT(DISTINCT a.id) as count
                   FROM account_balances ab
                   JOIN accounts a ON ab.account_id = a.id
                   JOIN account_types at ON a.type_id = at.id
                   WHERE at.category = 'asset' 
                   AND a.is_active = 1
                   AND ab.fiscal_period_id = ?";
    $stmt = $conn->prepare($assetQuery);
    $stmt->bind_param('i', $periodId);
    $stmt->execute();
    $assetResult = $stmt->get_result()->fetch_assoc();
    
    // Get Liabilities
    $liabilityQuery = "SELECT 
                        SUM(ABS(ab.closing_balance)) as total,
                        COUNT(DISTINCT a.id) as count
                       FROM account_balances ab
                       JOIN accounts a ON ab.account_id = a.id
                       JOIN account_types at ON a.type_id = at.id
                       WHERE at.category = 'liability' 
                       AND a.is_active = 1
                       AND ab.fiscal_period_id = ?";
    $stmt = $conn->prepare($liabilityQuery);
    $stmt->bind_param('i', $periodId);
    $stmt->execute();
    $liabilityResult = $stmt->get_result()->fetch_assoc();
    
    // Get Equity
    $equityQuery = "SELECT 
                     SUM(ABS(ab.closing_balance)) as total,
                     COUNT(DISTINCT a.id) as count
                    FROM account_balances ab
                    JOIN accounts a ON ab.account_id = a.id
                    JOIN account_types at ON a.type_id = at.id
                    WHERE at.category = 'equity' 
                    AND a.is_active = 1
                    AND ab.fiscal_period_id = ?";
    $stmt = $conn->prepare($equityQuery);
    $stmt->bind_param('i', $periodId);
    $stmt->execute();
    $equityResult = $stmt->get_result()->fetch_assoc();
    
    // Get Revenue
    $revenueQuery = "SELECT 
                      SUM(ABS(ab.closing_balance)) as total,
                      COUNT(DISTINCT a.id) as count
                     FROM account_balances ab
                     JOIN accounts a ON ab.account_id = a.id
                     JOIN account_types at ON a.type_id = at.id
                     WHERE at.category = 'revenue' 
                     AND a.is_active = 1
                     AND ab.fiscal_period_id = ?";
    $stmt = $conn->prepare($revenueQuery);
    $stmt->bind_param('i', $periodId);
    $stmt->execute();
    $revenueResult = $stmt->get_result()->fetch_assoc();
    
    // Get Expenses
    $expenseQuery = "SELECT 
                      SUM(ab.closing_balance) as total,
                      COUNT(DISTINCT a.id) as count
                     FROM account_balances ab
                     JOIN accounts a ON ab.account_id = a.id
                     JOIN account_types at ON a.type_id = at.id
                     WHERE at.category = 'expense' 
                     AND a.is_active = 1
                     AND ab.fiscal_period_id = ?";
    $stmt = $conn->prepare($expenseQuery);
    $stmt->bind_param('i', $periodId);
    $stmt->execute();
    $expenseResult = $stmt->get_result()->fetch_assoc();
    
    $data = [
        'total_assets' => floatval($assetResult['total'] ?? 0),
        'asset_accounts' => intval($assetResult['count'] ?? 0),
        'total_liabilities' => floatval($liabilityResult['total'] ?? 0),
        'liability_accounts' => intval($liabilityResult['count'] ?? 0),
        'total_equity' => floatval($equityResult['total'] ?? 0),
        'equity_accounts' => intval($equityResult['count'] ?? 0),
        'total_revenue' => floatval($revenueResult['total'] ?? 0),
        'revenue_accounts' => intval($revenueResult['count'] ?? 0),
        'total_expenses' => floatval($expenseResult['total'] ?? 0),
        'expense_accounts' => intval($expenseResult['count'] ?? 0)
    ];
    
    echo json_encode(['success' => true, 'data' => $data]);
}

// ========================================
// GET CHART DATA
// ========================================

function getChartData() {
    global $conn;
    
    // Account Types Distribution - Count accounts by category
    $accountTypesQuery = "SELECT 
                           at.category as label,
                           COUNT(a.id) as value
                          FROM accounts a
                          JOIN account_types at ON a.type_id = at.id
                          WHERE a.is_active = 1
                          GROUP BY at.category
                          ORDER BY value DESC";
    $result = $conn->query($accountTypesQuery);
    
    $accountTypes = ['labels' => [], 'values' => []];
    while ($row = $result->fetch_assoc()) {
        $accountTypes['labels'][] = ucfirst($row['label']);
        $accountTypes['values'][] = intval($row['value']);
    }
    
    // Transaction Summary by Journal Type
    $transactionSummaryQuery = "SELECT 
                                 jt.name as label,
                                 COUNT(je.id) as value
                                FROM journal_entries je
                                JOIN journal_types jt ON je.journal_type_id = jt.id
                                WHERE je.status = 'posted'
                                GROUP BY jt.id, jt.name
                                ORDER BY value DESC
                                LIMIT 10";
    $result = $conn->query($transactionSummaryQuery);
    
    $transactionSummary = ['labels' => [], 'values' => []];
    while ($row = $result->fetch_assoc()) {
        $transactionSummary['labels'][] = $row['label'];
        $transactionSummary['values'][] = intval($row['value']);
    }
    
    $data = [
        'account_types' => $accountTypes,
        'transaction_summary' => $transactionSummary
    ];
    
    echo json_encode(['success' => true, 'data' => $data]);
}

// ========================================
// GET RECENT TRANSACTIONS
// ========================================

function getRecentTransactions() {
    global $conn;
    
    $query = "SELECT 
               je.journal_no,
               je.entry_date,
               jt.name as journal_type,
               je.description,
               je.total_debit,
               je.total_credit,
               je.status
              FROM journal_entries je
              JOIN journal_types jt ON je.journal_type_id = jt.id
              WHERE je.status = 'posted'
              ORDER BY je.entry_date DESC, je.created_at DESC
              LIMIT 10";
    
    $result = $conn->query($query);
    $transactions = [];
    
    while ($row = $result->fetch_assoc()) {
        $transactions[] = [
            'journal_no' => $row['journal_no'],
            'entry_date' => date('M d, Y', strtotime($row['entry_date'])),
            'journal_type' => $row['journal_type'],
            'description' => $row['description'],
            'total_debit' => floatval($row['total_debit']),
            'total_credit' => floatval($row['total_credit']),
            'status' => $row['status']
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $transactions]);
}

// ========================================
// GET ACCOUNTS
// ========================================

function getAccounts() {
    global $conn;
    
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    
    // Get latest fiscal period
    $periodQuery = "SELECT id FROM fiscal_periods WHERE status = 'open' ORDER BY start_date DESC LIMIT 1";
    $periodResult = $conn->query($periodQuery);
    $period = $periodResult->fetch_assoc();
    $periodId = $period['id'] ?? 1;
    
    $query = "SELECT 
               a.code,
               a.name,
               at.category,
               COALESCE(ab.closing_balance, 0) as balance,
               a.is_active
              FROM accounts a
              JOIN account_types at ON a.type_id = at.id
              LEFT JOIN account_balances ab ON a.id = ab.account_id AND ab.fiscal_period_id = ?
              WHERE 1=1";
    
    $params = [$periodId];
    $types = 'i';
    
    if (!empty($category)) {
        $query .= " AND at.category = ?";
        $params[] = $category;
        $types .= 's';
    }
    
    if (!empty($search)) {
        $query .= " AND (a.code LIKE ? OR a.name LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ss';
    }
    
    $query .= " ORDER BY a.code";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $accounts = [];
    while ($row = $result->fetch_assoc()) {
        $accounts[] = [
            'code' => $row['code'],
            'name' => $row['name'],
            'category' => $row['category'],
            'balance' => floatval($row['balance']),
            'is_active' => boolval($row['is_active'])
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $accounts]);
}

// ========================================
// GET TRANSACTIONS
// ========================================

function getTransactions() {
    global $conn;
    
    $query = "SELECT 
               je.journal_no,
               je.entry_date,
               jt.name as journal_type,
               je.description,
               je.reference_no,
               je.total_debit,
               je.total_credit,
               je.status
              FROM journal_entries je
              JOIN journal_types jt ON je.journal_type_id = jt.id
              ORDER BY je.entry_date DESC, je.created_at DESC
              LIMIT 100";
    
    $result = $conn->query($query);
    $transactions = [];
    
    while ($row = $result->fetch_assoc()) {
        $transactions[] = [
            'journal_no' => $row['journal_no'],
            'entry_date' => date('M d, Y', strtotime($row['entry_date'])),
            'journal_type' => $row['journal_type'],
            'description' => $row['description'],
            'reference_no' => $row['reference_no'],
            'total_debit' => floatval($row['total_debit']),
            'total_credit' => floatval($row['total_credit']),
            'status' => $row['status']
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $transactions]);
}

// ========================================
// GET AUDIT TRAIL
// ========================================

function getAuditTrail() {
    global $conn;
    
    $query = "SELECT 
               al.created_at,
               u.full_name as user_name,
               al.action,
               al.object_type,
               al.object_id,
               al.ip_address
              FROM audit_logs al
              LEFT JOIN users u ON al.user_id = u.id
              WHERE al.object_type IN ('journal_entry', 'account', 'fiscal_period')
              ORDER BY al.created_at DESC
              LIMIT 50";
    
    $result = $conn->query($query);
    $auditLogs = [];
    
    while ($row = $result->fetch_assoc()) {
        $auditLogs[] = [
            'created_at' => date('M d, Y H:i:s', strtotime($row['created_at'])),
            'user_name' => $row['user_name'],
            'action' => $row['action'],
            'object_type' => $row['object_type'],
            'object_id' => $row['object_id'],
            'ip_address' => $row['ip_address']
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $auditLogs]);
}
?>

