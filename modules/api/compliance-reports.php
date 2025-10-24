<?php
/**
 * Compliance Reports API
 * Handles compliance report generation and audit trail operations
 * 
 * Database Tables Used:
 * - compliance_reports: Generated compliance reports
 * - audit_logs: Audit trail tracking
 * - journal_entries: Financial data for compliance checks
 * - accounts: Chart of accounts for compliance validation
 * - users: User information
 */

require_once '../../config/database.php';
require_once '../../includes/session.php';

header('Content-Type: application/json');

// Verify user is logged in
requireLogin();
$current_user = getCurrentUser();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'generate_compliance_report':
            generateComplianceReport();
            break;
        
        case 'get_compliance_reports':
            getComplianceReports();
            break;
        
        case 'get_compliance_status':
            getComplianceStatus();
            break;
        
        case 'get_audit_trail':
            getAuditTrail();
            break;
        
        case 'log_audit_action':
            logAuditAction();
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
 * Generate compliance report
 */
function generateComplianceReport() {
    global $conn, $current_user;
    
    $reportType = $_POST['report_type'] ?? '';
    $periodStart = $_POST['period_start'] ?? '';
    $periodEnd = $_POST['period_end'] ?? '';
    
    if (empty($reportType) || empty($periodStart) || empty($periodEnd)) {
        throw new Exception('Missing required parameters');
    }
    
    // Validate report type
    $validTypes = ['gaap', 'sox', 'bir', 'ifrs'];
    if (!in_array($reportType, $validTypes)) {
        throw new Exception('Invalid report type');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert compliance report record
        $stmt = $conn->prepare("
            INSERT INTO compliance_reports 
            (report_type, period_start, period_end, generated_by, status) 
            VALUES (?, ?, ?, ?, 'generating')
        ");
        $stmt->bind_param('sssi', $reportType, $periodStart, $periodEnd, $current_user['id']);
        $stmt->execute();
        $reportId = $conn->insert_id;
        
        // Generate compliance data based on type
        $complianceData = generateComplianceData($reportType, $periodStart, $periodEnd);
        
        // Update report with data
        $reportData = json_encode($complianceData);
        $stmt = $conn->prepare("
            UPDATE compliance_reports 
            SET report_data = ?, status = 'completed', compliance_score = ?
            WHERE id = ?
        ");
        $stmt->bind_param('sdi', $reportData, $complianceData['compliance_score'], $reportId);
        $stmt->execute();
        
        // Log audit action
        logAuditActionToDB('Generate Compliance Report', 'compliance_report', $reportId, [
            'report_type' => $reportType,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'compliance_score' => $complianceData['compliance_score']
        ]);
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'report_id' => $reportId,
                'report_type' => $reportType,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'compliance_score' => $complianceData['compliance_score'],
                'status' => 'completed',
                'generated_date' => date('Y-m-d H:i:s'),
                'issues_found' => $complianceData['issues_found'] ?? []
            ]
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * Generate compliance data based on report type
 */
function generateComplianceData($reportType, $periodStart, $periodEnd) {
    global $conn;
    
    $data = [
        'report_type' => $reportType,
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'compliance_score' => 0,
        'issues_found' => []
    ];
    
    switch ($reportType) {
        case 'gaap':
            $data = generateGAAPCompliance($periodStart, $periodEnd);
            break;
        case 'sox':
            $data = generateSOXCompliance($periodStart, $periodEnd);
            break;
        case 'bir':
            $data = generateBIRCompliance($periodStart, $periodEnd);
            break;
        case 'ifrs':
            $data = generateIFRSCompliance($periodStart, $periodEnd);
            break;
    }
    
    return $data;
}

/**
 * Generate GAAP compliance data
 */
function generateGAAPCompliance($periodStart, $periodEnd) {
    global $conn;
    
    $data = [
        'report_type' => 'gaap',
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'compliance_score' => 0,
        'issues_found' => []
    ];
    
    // Check if books are balanced
    $stmt = $conn->prepare("
        SELECT 
            SUM(jl.debit) as total_debits,
            SUM(jl.credit) as total_credits
        FROM journal_lines jl
        INNER JOIN journal_entries je ON jl.journal_entry_id = je.id
        WHERE je.entry_date BETWEEN ? AND ?
        AND je.status = 'posted'
    ");
    $stmt->bind_param('ss', $periodStart, $periodEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    $isBalanced = abs($result['total_debits'] - $result['total_credits']) < 0.01;
    
    if ($isBalanced) {
        $data['compliance_score'] += 40;
    } else {
        $data['issues_found'][] = 'Books are not balanced - Debits: ' . number_format($result['total_debits'], 2) . ', Credits: ' . number_format($result['total_credits'], 2);
    }
    
    // Check for proper account classifications
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM accounts a
        INNER JOIN account_types at ON a.type_id = at.id
        WHERE a.is_active = 1
        AND at.category IN ('asset', 'liability', 'equity', 'revenue', 'expense')
    ");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 30;
    } else {
        $data['issues_found'][] = 'No properly classified accounts found';
    }
    
    // Check for proper documentation
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM journal_entries je
        WHERE je.entry_date BETWEEN ? AND ?
        AND je.description IS NOT NULL
        AND je.description != ''
        AND je.status = 'posted'
    ");
    $stmt->bind_param('ss', $periodStart, $periodEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 30;
    } else {
        $data['issues_found'][] = 'Journal entries lack proper documentation';
    }
    
    return $data;
}

/**
 * Generate SOX compliance data
 */
function generateSOXCompliance($periodStart, $periodEnd) {
    global $conn;
    
    $data = [
        'report_type' => 'sox',
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'compliance_score' => 0,
        'issues_found' => []
    ];
    
    // Check for segregation of duties (different users for creation and approval)
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM journal_entries je
        WHERE je.entry_date BETWEEN ? AND ?
        AND je.created_by != je.posted_by
        AND je.status = 'posted'
    ");
    $stmt->bind_param('ss', $periodStart, $periodEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 50;
    } else {
        $data['issues_found'][] = 'Segregation of duties not properly implemented';
    }
    
    // Check for audit trail completeness
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM audit_logs al
        WHERE al.created_at BETWEEN ? AND ?
        AND al.object_type = 'journal_entry'
    ");
    $stmt->bind_param('ss', $periodStart, $periodEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 50;
    } else {
        $data['issues_found'][] = 'Insufficient audit trail documentation';
    }
    
    return $data;
}

/**
 * Generate BIR compliance data
 */
function generateBIRCompliance($periodStart, $periodEnd) {
    global $conn;
    
    $data = [
        'report_type' => 'bir',
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'compliance_score' => 0,
        'issues_found' => []
    ];
    
    // Check for proper tax account setup
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM accounts a
        WHERE a.is_active = 1
        AND (a.name LIKE '%tax%' OR a.name LIKE '%VAT%' OR a.name LIKE '%withholding%')
    ");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 40;
    } else {
        $data['issues_found'][] = 'Tax accounts not properly configured';
    }
    
    // Check for proper documentation
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM journal_entries je
        WHERE je.entry_date BETWEEN ? AND ?
        AND je.reference_no IS NOT NULL
        AND je.reference_no != ''
        AND je.status = 'posted'
    ");
    $stmt->bind_param('ss', $periodStart, $periodEnd);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 60;
    } else {
        $data['issues_found'][] = 'Journal entries lack proper reference numbers';
    }
    
    return $data;
}

/**
 * Generate IFRS compliance data
 */
function generateIFRSCompliance($periodStart, $periodEnd) {
    global $conn;
    
    $data = [
        'report_type' => 'ifrs',
        'period_start' => $periodStart,
        'period_end' => $periodEnd,
        'compliance_score' => 0,
        'issues_found' => []
    ];
    
    // Check for proper asset classification
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM accounts a
        INNER JOIN account_types at ON a.type_id = at.id
        WHERE a.is_active = 1
        AND at.category = 'asset'
        AND (a.name LIKE '%current%' OR a.name LIKE '%non-current%' OR a.name LIKE '%fixed%')
    ");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 50;
    } else {
        $data['issues_found'][] = 'Asset accounts not properly classified for IFRS';
    }
    
    // Check for proper revenue recognition
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM accounts a
        INNER JOIN account_types at ON a.type_id = at.id
        WHERE a.is_active = 1
        AND at.category = 'revenue'
    ");
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 0) {
        $data['compliance_score'] += 50;
    } else {
        $data['issues_found'][] = 'Revenue accounts not properly configured';
    }
    
    return $data;
}

/**
 * Get compliance reports
 */
function getComplianceReports() {
    global $conn;
    
    $stmt = $conn->prepare("
        SELECT 
            cr.*,
            u.full_name as generated_by_name
        FROM compliance_reports cr
        LEFT JOIN users u ON cr.generated_by = u.id
        ORDER BY cr.created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $reports
    ]);
}

/**
 * Get compliance status
 */
function getComplianceStatus() {
    global $conn;
    
    // Get latest compliance scores for each type
    $stmt = $conn->prepare("
        SELECT 
            report_type,
            compliance_score,
            issues_found,
            generated_date
        FROM compliance_reports
        WHERE status = 'completed'
        AND id IN (
            SELECT MAX(id) 
            FROM compliance_reports 
            WHERE status = 'completed'
            GROUP BY report_type
        )
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $status = [];
    while ($row = $result->fetch_assoc()) {
        $status[$row['report_type']] = [
            'score' => $row['compliance_score'],
            'issues' => $row['issues_found'],
            'last_checked' => $row['generated_date']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $status
    ]);
}

/**
 * Get audit trail
 */
function getAuditTrail() {
    global $conn;
    
    $dateFrom = $_GET['date_from'] ?? '';
    $dateTo = $_GET['date_to'] ?? '';
    $userFilter = $_GET['user_filter'] ?? '';
    $actionFilter = $_GET['action_filter'] ?? '';
    
    $sql = "SELECT 
                al.*,
                u.username,
                u.full_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE 1=1";
    
    $params = [];
    $types = '';
    
    if (!empty($dateFrom)) {
        $sql .= " AND DATE(al.created_at) >= ?";
        $params[] = $dateFrom;
        $types .= 's';
    }
    
    if (!empty($dateTo)) {
        $sql .= " AND DATE(al.created_at) <= ?";
        $params[] = $dateTo;
        $types .= 's';
    }
    
    if (!empty($userFilter) && $userFilter !== 'All Users') {
        $sql .= " AND u.username = ?";
        $params[] = $userFilter;
        $types .= 's';
    }
    
    if (!empty($actionFilter) && $actionFilter !== 'All Actions') {
        $sql .= " AND al.action LIKE ?";
        $params[] = '%' . $actionFilter . '%';
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
 * Log audit action
 */
function logAuditAction() {
    global $conn, $current_user;
    
    $action = $_POST['action'] ?? '';
    $objectType = $_POST['object_type'] ?? '';
    $objectId = $_POST['object_id'] ?? '';
    $additionalInfo = $_POST['additional_info'] ?? '';
    
    if (empty($action) || empty($objectType)) {
        throw new Exception('Missing required parameters');
    }
    
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    
    $stmt = $conn->prepare("
        INSERT INTO audit_logs 
        (user_id, ip_address, action, object_type, object_id, additional_info) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $additionalInfoJson = !empty($additionalInfo) ? json_encode($additionalInfo) : null;
    $stmt->bind_param('isssss', $current_user['id'], $ipAddress, $action, $objectType, $objectId, $additionalInfoJson);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Audit action logged successfully'
    ]);
}

/**
 * Log audit action to database (internal function)
 */
function logAuditActionToDB($action, $objectType, $objectId, $additionalInfo = []) {
    global $conn, $current_user;
    
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    
    $stmt = $conn->prepare("
        INSERT INTO audit_logs 
        (user_id, ip_address, action, object_type, object_id, additional_info) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $additionalInfoJson = !empty($additionalInfo) ? json_encode($additionalInfo) : null;
    $stmt->bind_param('isssss', $current_user['id'], $ipAddress, $action, $objectType, $objectId, $additionalInfoJson);
    $stmt->execute();
}
