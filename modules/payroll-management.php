<?php
require_once '../config/database.php';
require_once '../includes/session.php';

requireLogin();
$current_user = getCurrentUser();

// Get filter parameters from URL
$selected_employee = isset($_GET['employee']) ? $_GET['employee'] : '';
$search_term = isset($_GET['search']) ? $_GET['search'] : '';
$filter_position = isset($_GET['position']) ? $_GET['position'] : '';
$filter_department = isset($_GET['department']) ? $_GET['department'] : '';
$filter_type = isset($_GET['type']) ? $_GET['type'] : '';

// Build dynamic query for employees with filters
$employees_query = "SELECT * FROM employee_refs WHERE 1=1";
$params = [];
$types = "";

if (!empty($search_term)) {
    $employees_query .= " AND (name LIKE ? OR external_employee_no LIKE ?)";
    $search_param = "%$search_term%";
    $params[] = $search_param;
    $params[] = $search_param;
    $types .= "ss";
}

if (!empty($filter_position)) {
    $employees_query .= " AND position = ?";
    $params[] = $filter_position;
    $types .= "s";
}

if (!empty($filter_department)) {
    $employees_query .= " AND department = ?";
    $params[] = $filter_department;
    $types .= "s";
}

if (!empty($filter_type)) {
    $employees_query .= " AND employment_type = ?";
    $params[] = $filter_type;
    $types .= "s";
}

$employees_query .= " ORDER BY name";

// Execute query with parameters
if (!empty($params)) {
    $stmt = $conn->prepare($employees_query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $employees_result = $stmt->get_result();
} else {
    $employees_result = $conn->query($employees_query);
}

// Get unique values for filter dropdowns
$positions_query = "SELECT DISTINCT position FROM employee_refs WHERE position IS NOT NULL AND position != '' ORDER BY position";
$positions_result = $conn->query($positions_query);

$departments_query = "SELECT DISTINCT department FROM employee_refs WHERE department IS NOT NULL AND department != '' ORDER BY department";
$departments_result = $conn->query($departments_query);

$types_query = "SELECT DISTINCT employment_type FROM employee_refs ORDER BY employment_type";
$types_result = $conn->query($types_query);

// Get employee data for selected employee or first employee
if ($selected_employee) {
    $employee_query = "SELECT * FROM employee_refs WHERE external_employee_no = ?";
    $stmt = $conn->prepare($employee_query);
    $stmt->bind_param("s", $selected_employee);
    $stmt->execute();
    $employee_result = $stmt->get_result();
    $current_employee = $employee_result->fetch_assoc();
} else {
    $employee_result = $conn->query("SELECT * FROM employee_refs ORDER BY name LIMIT 1");
    $current_employee = $employee_result->fetch_assoc();
    $selected_employee = $current_employee ? $current_employee['external_employee_no'] : '';
}

// Fetch salary components for earnings
$earnings_query = "SELECT * FROM salary_components WHERE type = 'earning' AND is_active = 1 ORDER BY name";
$earnings_result = $conn->query($earnings_query);

// Fetch salary components for deductions
$deductions_query = "SELECT * FROM salary_components WHERE type = 'deduction' AND is_active = 1 ORDER BY name";
$deductions_result = $conn->query($deductions_query);

// Fetch salary components for tax
$tax_query = "SELECT * FROM salary_components WHERE type = 'tax' AND is_active = 1 ORDER BY name";
$tax_result = $conn->query($tax_query);

// Fetch salary components for employer contributions
$employer_contrib_query = "SELECT * FROM salary_components WHERE type = 'employer_contrib' AND is_active = 1 ORDER BY name";
$employer_contrib_result = $conn->query($employer_contrib_query);


// Fetch bank accounts for company info
$bank_accounts_query = "SELECT * FROM bank_accounts WHERE is_active = 1 LIMIT 1";
$bank_account_result = $conn->query($bank_accounts_query);
$company_bank = $bank_account_result->fetch_assoc();

// Calculate totals for payroll
$total_earnings = 0;
$total_deductions = 0;
$total_employer_contrib = 0;

// Calculate earnings total
if ($earnings_result) {
    $earnings_result->data_seek(0);
    while($earning = $earnings_result->fetch_assoc()) {
        $total_earnings += $earning['value'];
    }
}

// Calculate deductions total
if ($deductions_result) {
    $deductions_result->data_seek(0);
    while($deduction = $deductions_result->fetch_assoc()) {
        $total_deductions += $deduction['value'];
    }
}

// Calculate employer contributions total
if ($employer_contrib_result) {
    $employer_contrib_result->data_seek(0);
    while($contrib = $employer_contrib_result->fetch_assoc()) {
        $total_employer_contrib += $contrib['value'];
    }
}

// Get payslip data for selected employee
$payslip_data = null;
if ($selected_employee) {
    $payslip_query = "SELECT ps.*, pr.run_at, pr.status as payroll_status 
                      FROM payslips ps 
                      JOIN payroll_runs pr ON ps.payroll_run_id = pr.id 
                      WHERE ps.employee_external_no = ? 
                      ORDER BY pr.run_at DESC 
                      LIMIT 1";
    $payslip_stmt = $conn->prepare($payslip_query);
    $payslip_stmt->bind_param("s", $selected_employee);
    $payslip_stmt->execute();
    $payslip_result = $payslip_stmt->get_result();
    $payslip_data = $payslip_result->fetch_assoc();
}

// Get recent payslips for history
$recent_payslips_query = "SELECT ps.*, pr.run_at, pr.status as payroll_status 
                          FROM payslips ps 
                          JOIN payroll_runs pr ON ps.payroll_run_id = pr.id 
                          WHERE ps.employee_external_no = ? 
                          ORDER BY pr.run_at DESC 
                          LIMIT 5";
$recent_payslips_stmt = $conn->prepare($recent_payslips_query);
$recent_payslips_stmt->bind_param("s", $selected_employee);
$recent_payslips_stmt->execute();
$recent_payslips_result = $recent_payslips_stmt->get_result();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll Management - Accounting and Finance System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/payroll-management.css">
</head>
<body>
    <!-- Header -->
    <header class="main-header">
        <div class="header-left">
            <div class="logo-circle">E</div>
            <div class="logo-text">
                <h1>EVERGREEN</h1>
                <p>Secure. Invest. Achieve</p>
            </div>
        </div>
        <nav class="main-nav">
            <a href="../core/dashboard.php" class="nav-link">HOME</a>
            <a href="../core/dashboard.php" class="nav-link">DASHBOARD</a>
            <a href="#" class="nav-link active">MODULES</a>
        </nav>
        <div class="header-right">
            <span class="user-name">Welcome, <?php echo htmlspecialchars($current_user['full_name']); ?></span>
            <a href="../core/logout.php" class="btn-logout">Logout</a>
        </div>
    </header>
    
    <!-- Page Title -->
    <div class="page-header-payroll">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h2>Payroll Management</h2>
                </div>
                <div class="col-md-6">
                    <div class="employee-selector">
                        <label for="employee-select" class="form-label">Select Employee:</label>
                        <select class="form-select" id="employee-select" onchange="changeEmployee()">
                            <option value="">Choose an employee...</option>
                            <?php 
                            $employees_result->data_seek(0);
                            while($emp = $employees_result->fetch_assoc()): 
                            ?>
                                <option value="<?php echo $emp['external_employee_no']; ?>" 
                                        <?php echo ($emp['external_employee_no'] == $selected_employee) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['name'] . ' (' . $emp['external_employee_no'] . ')'); ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Search and Filters -->
            <div class="search-filters-section">
                <div class="row">
                    <div class="col-md-12">
                        <div class="search-filters-card">
                            <div class="filters-header">
                                <div class="filters-title-section">
                                    <h5><i class="fas fa-search me-2"></i>Search & Filter Employees</h5>
                                    <div class="results-counter">
                                        <span class="badge bg-primary">
                                            <?php echo $employees_result->num_rows; ?> employee<?php echo $employees_result->num_rows != 1 ? 's' : ''; ?> found
                                        </span>
                                    </div>
                                </div>
                                <button class="btn-toggle-filters" onclick="toggleFilters()">
                                    <i class="fas fa-filter me-1"></i>Filters
                                    <i class="fas fa-chevron-down" id="filter-chevron"></i>
                                </button>
                            </div>
                            
                            <div class="filters-content" id="filters-content">
                                <form method="GET" class="filters-form">
                                    <div class="row g-3">
                                        <!-- Search Bar -->
                                        <div class="col-md-4">
                                            <label for="search" class="form-label">Search</label>
                                            <div class="input-group">
                                                <span class="input-group-text">
                                                    <i class="fas fa-search"></i>
                                                </span>
                                                <input type="text" class="form-control" id="search" name="search" 
                                                       placeholder="Search by name or employee number..." 
                                                       value="<?php echo htmlspecialchars($search_term); ?>">
                                            </div>
                                        </div>
                                        
                                        <!-- Position Filter -->
                                        <div class="col-md-2">
                                            <label for="position" class="form-label">Position</label>
                                            <select class="form-select" id="position" name="position">
                                                <option value="">All Positions</option>
                                                <?php 
                                                $positions_result->data_seek(0);
                                                while($pos = $positions_result->fetch_assoc()): 
                                                ?>
                                                    <option value="<?php echo htmlspecialchars($pos['position']); ?>" 
                                                            <?php echo ($pos['position'] == $filter_position) ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars($pos['position']); ?>
                                                    </option>
                                                <?php endwhile; ?>
                                            </select>
                                        </div>
                                        
                                        <!-- Department Filter -->
                                        <div class="col-md-2">
                                            <label for="department" class="form-label">Department</label>
                                            <select class="form-select" id="department" name="department">
                                                <option value="">All Departments</option>
                                                <?php 
                                                $departments_result->data_seek(0);
                                                while($dept = $departments_result->fetch_assoc()): 
                                                ?>
                                                    <option value="<?php echo htmlspecialchars($dept['department']); ?>" 
                                                            <?php echo ($dept['department'] == $filter_department) ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars($dept['department']); ?>
                                                    </option>
                                                <?php endwhile; ?>
                                            </select>
                                        </div>
                                        
                                        <!-- Employment Type Filter -->
                                        <div class="col-md-2">
                                            <label for="type" class="form-label">Type</label>
                                            <select class="form-select" id="type" name="type">
                                                <option value="">All Types</option>
                                                <?php 
                                                $types_result->data_seek(0);
                                                while($type = $types_result->fetch_assoc()): 
                                                ?>
                                                    <option value="<?php echo htmlspecialchars($type['employment_type']); ?>" 
                                                            <?php echo ($type['employment_type'] == $filter_type) ? 'selected' : ''; ?>>
                                                        <?php echo ucfirst($type['employment_type']); ?>
                                                    </option>
                                                <?php endwhile; ?>
                                            </select>
                                        </div>
                                        
                                        <!-- Action Buttons -->
                                        <div class="col-md-2">
                                            <label class="form-label">&nbsp;</label>
                                            <div class="d-flex gap-2">
                                                <button type="submit" class="btn btn-primary btn-sm">
                                                    <i class="fas fa-search me-1"></i>Search
                                                </button>
                                                <a href="?" class="btn btn-outline-secondary btn-sm">
                                                    <i class="fas fa-times me-1"></i>Clear
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <?php if ($current_employee): ?>
            <div class="current-employee-info">
                <div class="row">
                    <div class="col-md-3">
                        <strong>Employee:</strong> <?php echo htmlspecialchars($current_employee['name']); ?>
                    </div>
                    <div class="col-md-3">
                        <strong>Position:</strong> <?php echo htmlspecialchars($current_employee['position'] ?? 'N/A'); ?>
                    </div>
                    <div class="col-md-3">
                        <strong>Department:</strong> <?php echo htmlspecialchars($current_employee['department'] ?? 'N/A'); ?>
                    </div>
                    <div class="col-md-3">
                        <strong>Type:</strong> <?php echo ucfirst($current_employee['employment_type'] ?? 'N/A'); ?>
                    </div>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Main Content -->
    <main class="container-fluid py-4">
        <!-- Tab Navigation -->
        <div class="payroll-tabs-container">
            <ul class="nav nav-pills payroll-nav-tabs" id="payrollTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="employee-details-tab" data-bs-toggle="pill" data-bs-target="#employee-details" type="button" role="tab">
                        Employee Details
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="payroll-info-tab" data-bs-toggle="pill" data-bs-target="#payroll-info" type="button" role="tab">
                        Payroll Information
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tax-mgmt-tab" data-bs-toggle="pill" data-bs-target="#tax-mgmt" type="button" role="tab">
                        Tax Management
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="overall-tab" data-bs-toggle="pill" data-bs-target="#overall" type="button" role="tab">
                        Overall
                    </button>
                </li>
            </ul>
        </div>

        <!-- Tab Content -->
        <div class="tab-content" id="payrollTabsContent">
            
            <!-- EMPLOYEE DETAILS TAB -->
            <div class="tab-pane fade show active" id="employee-details" role="tabpanel">
                <div class="payroll-content-card">
                    <h3 class="payroll-section-title">Employee Details</h3>
                    
                    <?php if ($current_employee): ?>
                        <div class="employee-details-grid">
                            <div class="employee-photo-section">
                                <div class="employee-photo">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="employee-status">
                                    <span class="status-badge status-<?php echo $current_employee['employment_type']; ?>">
                                        <?php echo ucfirst($current_employee['employment_type']); ?>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="employee-info-section">
                                <table class="employee-info-table">
                                    <tr>
                                        <td>Employee Number</td>
                                        <td><?php echo htmlspecialchars($current_employee['external_employee_no']); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Full Name</td>
                                        <td><?php echo htmlspecialchars($current_employee['name'] ?? 'N/A'); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Position</td>
                                        <td><?php echo htmlspecialchars($current_employee['position'] ?? 'N/A'); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Department</td>
                                        <td><?php echo htmlspecialchars($current_employee['department'] ?? 'N/A'); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Employment Type</td>
                                        <td><?php echo ucfirst($current_employee['employment_type'] ?? 'N/A'); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Date of Joining</td>
                                        <td><?php echo date('F d, Y', strtotime($current_employee['created_at'])); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Bank Name</td>
                                        <td><?php echo htmlspecialchars($company_bank['bank_name'] ?? 'N/A'); ?></td>
                                    </tr>
                                    <tr>
                                        <td>Bank Account Number</td>
                                        <td><?php echo htmlspecialchars($company_bank['account_number'] ?? 'N/A'); ?></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h4>No Employee Selected</h4>
                            <p>Please select an employee from the dropdown above to view their details.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- PAYROLL INFORMATION TAB -->
            <div class="tab-pane fade" id="payroll-info" role="tabpanel">
                <div class="payroll-content-card">
                    <h3 class="payroll-section-title">Payroll Information</h3>
                    
                    <?php if ($payslip_data): ?>
                        <div class="payslip-header">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Pay Period:</strong> <?php echo date('F Y', strtotime($payslip_data['run_at'])); ?>
                                </div>
                                <div class="col-md-6 text-end">
                                    <span class="status-badge status-<?php echo $payslip_data['payroll_status']; ?>">
                                        <?php echo ucfirst($payslip_data['payroll_status']); ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <div class="payroll-two-column">
                        <!-- Earnings Column -->
                        <div class="payroll-column-card">
                            <div class="payroll-column-title">Earnings</div>
                            <table class="payroll-items-table">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th class="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php 
                                    $current_earnings_total = 0;
                                    if ($earnings_result && $earnings_result->num_rows > 0): 
                                        $earnings_result->data_seek(0);
                                        while($earning = $earnings_result->fetch_assoc()): 
                                            // Use payslip JSON data if available for accurate Philippine calculations
                                            $amount = 0;
                                            if ($payslip_data && $payslip_data['payslip_json']) {
                                                $payslip_json = json_decode($payslip_data['payslip_json'], true);
                                                switch($earning['code']) {
                                                    case 'BASIC': $amount = $payslip_json['basic_salary'] ?? $earning['value']; break;
                                                    case 'COLA': $amount = $payslip_json['cola'] ?? $earning['value']; break;
                                                    case 'MEAL': $amount = $payslip_json['meal_allowance'] ?? $earning['value']; break;
                                                    case 'COMM': $amount = $payslip_json['comm_allowance'] ?? $earning['value']; break;
                                                    case 'RICE': $amount = $payslip_json['rice_subsidy'] ?? $earning['value']; break;
                                                    case 'TRANSPORT': $amount = $payslip_json['transport_allowance'] ?? $earning['value']; break;
                                                    default: $amount = $earning['value']; break;
                                                }
                                            } else {
                                                $amount = $earning['value'];
                                            }
                                            $current_earnings_total += $amount;
                                    ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($earning['name']); ?></td>
                                            <td class="amount-cell">₱<?php echo number_format($amount, 2); ?></td>
                                        </tr>
                                    <?php 
                                        endwhile; 
                                    else:
                                    ?>
                                        <tr>
                                            <td colspan="2" class="text-center text-muted">No earnings data available</td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                                <tfoot>
                                    <tr class="payroll-total-row">
                                        <td><strong>Gross Earnings</strong></td>
                                        <td class="amount-cell"><strong>₱<?php echo number_format($current_earnings_total, 2); ?></strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Deductions Column -->
                        <div class="payroll-column-card">
                            <div class="payroll-column-title">Deductions</div>
                            <table class="payroll-items-table">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th class="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php 
                                    $current_deductions_total = 0;
                                    if ($deductions_result && $deductions_result->num_rows > 0): 
                                        $deductions_result->data_seek(0);
                                        while($deduction = $deductions_result->fetch_assoc()): 
                                            // Use payslip JSON data if available for accurate Philippine calculations
                                            $amount = 0;
                                            if ($payslip_data && $payslip_data['payslip_json']) {
                                                $payslip_json = json_decode($payslip_data['payslip_json'], true);
                                                switch($deduction['code']) {
                                                    case 'SSS_EMP': $amount = $payslip_json['sss_emp'] ?? $deduction['value']; break;
                                                    case 'PAGIBIG_EMP': $amount = $payslip_json['pagibig_emp'] ?? $deduction['value']; break;
                                                    case 'PHILHEALTH_EMP': $amount = $payslip_json['philhealth_emp'] ?? $deduction['value']; break;
                                                    case 'WHT': $amount = $payslip_json['withholding_tax'] ?? $deduction['value']; break;
                                                    case 'LOAN': $amount = $payslip_json['loan_deduction'] ?? $deduction['value']; break;
                                                    case 'UNIFORM': $amount = $payslip_json['uniform_deduction'] ?? $deduction['value']; break;
                                                    default: $amount = $deduction['value']; break;
                                                }
                                            } else {
                                                $amount = $deduction['value'];
                                            }
                                            $current_deductions_total += $amount;
                                    ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($deduction['name']); ?></td>
                                            <td class="amount-cell">₱<?php echo number_format($amount, 2); ?></td>
                                        </tr>
                                    <?php 
                                        endwhile;
                                    else:
                                    ?>
                                        <tr>
                                            <td colspan="2" class="text-center text-muted">No deductions data available</td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                                <tfoot>
                                    <tr class="payroll-total-row">
                                        <td><strong>Total Deductions</strong></td>
                                        <td class="amount-cell"><strong>₱<?php echo number_format($current_deductions_total, 2); ?></strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- Net Salary -->
                    <div class="net-salary-box">
                        <div class="label">Net Salary:</div>
                        <div class="amount">₱<?php echo number_format($current_earnings_total - $current_deductions_total, 2); ?></div>
                    </div>
                    
                    <!-- Recent Payslips -->
                    <?php if ($recent_payslips_result && $recent_payslips_result->num_rows > 0): ?>
                        <div class="recent-payslips-section">
                            <h5 class="section-subtitle">Recent Payslips</h5>
                            <div class="table-container">
                                <table class="history-table">
                                    <thead>
                                        <tr>
                                            <th>Pay Period</th>
                                            <th>Gross Pay</th>
                                            <th>Deductions</th>
                                            <th>Net Pay</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php 
                                        $recent_payslips_result->data_seek(0);
                                        while($payslip = $recent_payslips_result->fetch_assoc()): 
                                        ?>
                                            <tr>
                                                <td><?php echo date('M Y', strtotime($payslip['run_at'])); ?></td>
                                                <td>₱<?php echo number_format($payslip['gross_pay'], 2); ?></td>
                                                <td>₱<?php echo number_format($payslip['total_deductions'], 2); ?></td>
                                                <td>₱<?php echo number_format($payslip['net_pay'], 2); ?></td>
                                                <td>
                                                    <span class="status-badge status-<?php echo $payslip['payroll_status']; ?>">
                                                        <?php echo ucfirst($payslip['payroll_status']); ?>
                                                    </span>
                                                </td>
                                            </tr>
                                        <?php endwhile; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- TAX MANAGEMENT TAB -->
            <div class="tab-pane fade" id="tax-mgmt" role="tabpanel">
                <div class="payroll-content-card">
                    <h3 class="payroll-section-title">Tax Details</h3>
                    
                    <?php if ($payslip_data): ?>
                        <div class="tax-period-info">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Tax Period:</strong> <?php echo date('F Y', strtotime($payslip_data['run_at'])); ?>
                                </div>
                                <div class="col-md-6 text-end">
                                    <strong>Employee:</strong> <?php echo htmlspecialchars($current_employee['name']); ?>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <div class="tax-details-container">
                        <!-- Tax Deductions -->
                        <div class="tax-section">
                            <div class="tax-section-header">Employee Tax Contributions</div>
                            <table class="tax-items-table">
                                <?php 
                                $employee_tax_total = 0;
                                if ($tax_result && $tax_result->num_rows > 0): 
                                    $tax_result->data_seek(0);
                                    while($tax = $tax_result->fetch_assoc()): 
                                        // Use payslip JSON data if available for accurate Philippine calculations
                                        $tax_amount = 0;
                                        if ($payslip_data && $payslip_data['payslip_json']) {
                                            $payslip_json = json_decode($payslip_data['payslip_json'], true);
                                            switch($tax['code']) {
                                                case 'SSS_TAX': $tax_amount = $payslip_json['sss_emp'] ?? $tax['value']; break;
                                                case 'PAGIBIG_TAX': $tax_amount = $payslip_json['pagibig_emp'] ?? $tax['value']; break;
                                                case 'PHILHEALTH_TAX': $tax_amount = $payslip_json['philhealth_emp'] ?? $tax['value']; break;
                                                case 'WHT_TAX': $tax_amount = $payslip_json['withholding_tax'] ?? $tax['value']; break;
                                                default: $tax_amount = $tax['value']; break;
                                            }
                                        } else {
                                            $tax_amount = $tax['value'];
                                        }
                                        $employee_tax_total += $tax_amount;
                                ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($tax['name']); ?></td>
                                        <td>₱<?php echo number_format($tax_amount, 2); ?></td>
                                    </tr>
                                <?php 
                                    endwhile;
                                else:
                                ?>
                                    <tr>
                                        <td colspan="2" class="text-center text-muted">No tax data available</td>
                                    </tr>
                                <?php endif; ?>
                                <tr class="tax-total-row">
                                    <td><strong>Total Employee Tax</strong></td>
                                    <td><strong>₱<?php echo number_format($employee_tax_total, 2); ?></strong></td>
                                </tr>
                            </table>
                        </div>

                        <!-- Employer Contributions -->
                        <div class="tax-section">
                            <div class="tax-section-header">Employer Contribution</div>
                            <table class="tax-items-table">
                                <?php 
                                $employer_total = 0;
                                if ($employer_contrib_result && $employer_contrib_result->num_rows > 0): 
                                    $employer_contrib_result->data_seek(0);
                                    while($contrib = $employer_contrib_result->fetch_assoc()): 
                                        // Calculate actual employer contribution based on Philippine rates
                                        $contrib_amount = 0;
                                        if ($payslip_data && $payslip_data['payslip_json']) {
                                            $payslip_json = json_decode($payslip_data['payslip_json'], true);
                                            $basic_salary = $payslip_json['basic_salary'] ?? 0;
                                            switch($contrib['code']) {
                                                case 'SSS_ER': $contrib_amount = $basic_salary * 0.085; break; // 8.5% of basic
                                                case 'PAGIBIG_ER': $contrib_amount = 100; break; // Fixed ₱100
                                                case 'PHILHEALTH_ER': $contrib_amount = $basic_salary * 0.03; break; // 3% of basic
                                                case 'SSS_EC': $contrib_amount = 10; break; // Fixed ₱10
                                                case '13TH_MONTH_ER': $contrib_amount = $basic_salary * 0.0833; break; // 8.33% of basic
                                                default: $contrib_amount = $contrib['value']; break;
                                            }
                                        } else {
                                            $contrib_amount = $contrib['value'];
                                        }
                                        $employer_total += $contrib_amount;
                                ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($contrib['name']); ?></td>
                                        <td>₱<?php echo number_format($contrib_amount, 2); ?></td>
                                    </tr>
                                <?php 
                                    endwhile;
                                else:
                                ?>
                                    <tr>
                                        <td colspan="2" class="text-center text-muted">No employer contribution data available</td>
                                    </tr>
                                <?php endif; ?>
                                <tr class="tax-total-row">
                                    <td><strong>Total Employer Contribution</strong></td>
                                    <td><strong>₱<?php echo number_format($employer_total, 2); ?></strong></td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- Tax Summary -->
                        <div class="tax-summary-box">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="tax-summary-item">
                                        <span class="label">Employee Tax:</span>
                                        <span class="value">₱<?php echo number_format($employee_tax_total, 2); ?></span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="tax-summary-item">
                                        <span class="label">Employer Contribution:</span>
                                        <span class="value">₱<?php echo number_format($employer_total, 2); ?></span>
                                    </div>
                                </div>
                            </div>
                            <div class="tax-summary-total">
                                <span class="label">Total Tax Burden:</span>
                                <span class="value">₱<?php echo number_format($employee_tax_total + $employer_total, 2); ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- OVERALL TAB -->
            <div class="tab-pane fade" id="overall" role="tabpanel">
                <div class="payroll-content-card">
                    <h3 class="payroll-section-title">Payroll Complete Details</h3>
                    
                    <!-- Company Header -->
                    <div class="overall-header">
                        <div class="bank-name"><?php echo htmlspecialchars($company_bank['bank_name'] ?? 'BANK NAME'); ?></div>
                        <div class="company-name">(<?php echo htmlspecialchars($company_bank['name'] ?? 'Company Name'); ?>)</div>
                        <div class="company-address">Company Address</div>
                    </div>

                    <!-- Employee Details Section -->
                    <div class="overall-section">
                        <div class="overall-section-title">Employee Details</div>
                        <?php 
                        $employees_result->data_seek(0); // Reset pointer
                        if ($employees_result && $employees_result->num_rows > 0): 
                            $employee = $employees_result->fetch_assoc();
                        ?>
                            <table class="employee-info-table">
                                <tr>
                                    <td>Employee Code</td>
                                    <td><?php echo htmlspecialchars($employee['external_employee_no']); ?></td>
                                </tr>
                                <tr>
                                    <td>Employee Name</td>
                                    <td><?php echo htmlspecialchars($employee['name'] ?? 'N/A'); ?></td>
                                </tr>
                                <tr>
                                    <td>Bank Name</td>
                                    <td><?php echo htmlspecialchars($company_bank['bank_name'] ?? 'N/A'); ?></td>
                                </tr>
                                <tr>
                                    <td>Bank Account Number</td>
                                    <td><?php echo htmlspecialchars($company_bank['account_number'] ?? 'N/A'); ?></td>
                                </tr>
                                <tr>
                                    <td>Date of Joining</td>
                                    <td><?php echo date('m/d/Y', strtotime($employee['created_at'])); ?></td>
                                </tr>
                                <tr>
                                    <td>Payout Date</td>
                                    <td><?php echo date('m/d/Y'); ?></td>
                                </tr>
                                <tr>
                                    <td>Position</td>
                                    <td><?php echo htmlspecialchars($employee['position'] ?? 'N/A'); ?></td>
                                </tr>
                            </table>
                        <?php endif; ?>
                    </div>

                    <!-- Earnings and Deductions -->
                    <div class="overall-section">
                        <div class="payroll-two-column">
                            <!-- Earnings -->
                            <div>
                                <div class="overall-section-title">Earnings</div>
                                <table class="payroll-items-table">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th class="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php 
                                        $earnings_result->data_seek(0); // Reset pointer
                                        $total_earnings_overall = 0;
                                        if ($earnings_result && $earnings_result->num_rows > 0): 
                                            while($earning = $earnings_result->fetch_assoc()): 
                                                $amount = $earning['value'];
                                                $total_earnings_overall += $amount;
                                        ?>
                                            <tr>
                                                <td><?php echo htmlspecialchars($earning['name']); ?></td>
                                                <td class="amount-cell"><?php echo number_format($amount, 2); ?></td>
                                            </tr>
                                        <?php endwhile; endif; ?>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Deductions -->
                            <div>
                                <div class="overall-section-title">Deductions</div>
                                <table class="payroll-items-table">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th class="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php 
                                        $deductions_result->data_seek(0); // Reset pointer
                                        $total_deductions_overall = 0;
                                        if ($deductions_result && $deductions_result->num_rows > 0): 
                                            while($deduction = $deductions_result->fetch_assoc()): 
                                                $amount = $deduction['value'];
                                                $total_deductions_overall += $amount;
                                        ?>
                                            <tr>
                                                <td><?php echo htmlspecialchars($deduction['name']); ?></td>
                                                <td class="amount-cell"><?php echo number_format($amount, 2); ?></td>
                                            </tr>
                                        <?php endwhile; endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Employer Contribution -->
                    <div class="overall-section">
                        <div class="overall-section-title">Employer Contribution</div>
                        <table class="tax-items-table">
                            <?php 
                            $employer_contrib_result->data_seek(0); // Reset pointer
                            if ($employer_contrib_result && $employer_contrib_result->num_rows > 0): 
                                while($contrib = $employer_contrib_result->fetch_assoc()): 
                            ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($contrib['name']); ?></td>
                                    <td>₱<?php echo number_format($contrib['value'], 2); ?></td>
                                </tr>
                            <?php endwhile; endif; ?>
                        </table>
                    </div>

                    <!-- Summary -->
                    <div class="overall-summary-box">
                        <div class="overall-summary-row">
                            <span class="label">Gross Earnings:</span>
                            <span class="value">₱<?php echo number_format($total_earnings_overall, 2); ?></span>
                        </div>
                        <div class="overall-summary-row">
                            <span class="label">Total Deductions:</span>
                            <span class="value">₱<?php echo number_format($total_deductions_overall, 2); ?></span>
                        </div>
                        <div class="overall-summary-row">
                            <span class="label">Net Salary:</span>
                            <span class="value">₱<?php echo number_format($total_earnings_overall - $total_deductions_overall, 2); ?></span>
                        </div>
                    </div>

                    <!-- Print Button -->
                    <div class="text-center mt-4 no-print">
                        <button class="btn-print" onclick="printPayslip()">
                            <i class="fas fa-print me-2"></i>Print Payslip
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </main>
    
    <!-- Footer -->
    <footer class="main-footer">
        <p>&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
    </footer>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Custom JS -->
    <script src="../assets/js/payroll-management.js"></script>
</body>
</html>
