<?php
require_once '../config/database.php';
require_once '../includes/session.php';

requireLogin();
$current_user = getCurrentUser();

// Get filter parameters
$dateFrom = $_GET['date_from'] ?? '';
$dateTo = $_GET['date_to'] ?? '';
$transactionType = $_GET['transaction_type'] ?? '';
$status = $_GET['status'] ?? '';
$accountNumber = $_GET['account_number'] ?? '';
$applyFilters = isset($_GET['apply_filters']);

// Build query - matching actual schema columns
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
if ($applyFilters) {
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
    
    // Transaction type filter - skip since we don't have this column
    // if (!empty($transactionType)) {
    //     $sql .= " AND l.transaction_type = ?";
    //     $params[] = $transactionType;
    //     $types .= 's';
    // }
    
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
}

$sql .= " ORDER BY l.start_date DESC, l.loan_no DESC";

// Execute query
$loans = [];
$hasResults = false;

if ($conn) {
    // Check if prepare succeeded
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        // Query preparation failed - likely table doesn't exist yet
        $loans = [];
        $hasResults = false;
    } else {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $loans[] = $row;
        }
        
        $hasResults = count($loans) > 0;
        $stmt->close();
    }
}

// Calculate statistics
$totalLoans = count($loans);
$totalAmount = 0;
$totalOutstanding = 0;
$activeLoans = 0;

foreach ($loans as $loan) {
    $totalAmount += $loan['loan_amount'];
    $totalOutstanding += $loan['outstanding_balance'];
    if ($loan['status'] === 'active') {
        $activeLoans++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Accounting - Accounting and Finance System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/financial-reporting.css">
    <link rel="stylesheet" href="../assets/css/loan-accounting.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container-fluid px-4">
            <div class="logo-section">
                <div class="logo-circle">E</div>
                <div class="logo-text">
                    <h1>EVERGREEN</h1>
                    <p>Secure. Invest. Achieve</p>
                </div>
            </div>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="../core/dashboard.php">
                            <i class="fas fa-home me-1"></i>Home
                        </a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="modulesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-th-large me-1"></i>Modules
                        </a>
                        <ul class="dropdown-menu dropdown-menu-custom" aria-labelledby="modulesDropdown">
                            <li><a class="dropdown-item" href="general-ledger.php"><i class="fas fa-book me-2"></i>General Ledger</a></li>
                            <li><a class="dropdown-item" href="financial-reporting.php"><i class="fas fa-chart-line me-2"></i>Financial Reporting</a></li>
                            <li><a class="dropdown-item active" href="loan-accounting.php"><i class="fas fa-hand-holding-usd me-2"></i>Loan Accounting</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="transaction-reading.php"><i class="fas fa-exchange-alt me-2"></i>Transaction Reading</a></li>
                            <li><a class="dropdown-item" href="expense-tracking.php"><i class="fas fa-receipt me-2"></i>Expense Tracking</a></li>
                            <li><a class="dropdown-item" href="payroll-management.php"><i class="fas fa-users me-2"></i>Payroll Management</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="reportsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-file-alt me-1"></i>Reports
                        </a>
                        <ul class="dropdown-menu dropdown-menu-custom" aria-labelledby="reportsDropdown">
                            <li><a class="dropdown-item" href="financial-reporting.php"><i class="fas fa-chart-bar me-2"></i>Financial Statements</a></li>
                            <li><a class="dropdown-item" href="financial-reporting.php"><i class="fas fa-money-bill-wave me-2"></i>Cash Flow Report</a></li>
                            <li><a class="dropdown-item" href="expense-tracking.php"><i class="fas fa-clipboard-list me-2"></i>Expense Summary</a></li>
                            <li><a class="dropdown-item" href="payroll-management.php"><i class="fas fa-wallet me-2"></i>Payroll Report</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="settingsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-cog me-1"></i>Settings
                        </a>
                        <ul class="dropdown-menu dropdown-menu-custom" aria-labelledby="settingsDropdown">
                            <li><a class="dropdown-item" href="bin-station.php"><i class="fas fa-trash-alt me-2"></i>Bin Station</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="database-settings.php"><i class="fas fa-database me-2"></i>Database Settings</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            
            <div class="d-flex align-items-center gap-3">
                <!-- Notifications -->
                <div class="dropdown d-none d-md-block">
                    <a class="nav-icon-btn" href="#" id="notificationsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge">3</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end dropdown-menu-custom notifications-dropdown" aria-labelledby="notificationsDropdown">
                        <li class="dropdown-header">Notifications</li>
                        <li><hr class="dropdown-divider"></li>
                        <li class="dropdown-item text-center text-muted"><small>Loading notifications...</small></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-center small" href="activity-log.php">View All Notifications</a></li>
                    </ul>
                </div>
                
                <!-- User Profile Dropdown -->
                <div class="dropdown">
                    <a class="user-profile-btn" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user-circle me-2"></i>
                        <span class="d-none d-lg-inline"><?php echo htmlspecialchars($current_user['full_name']); ?></span>
                        <i class="fas fa-chevron-down ms-2 d-none d-lg-inline"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end dropdown-menu-custom" aria-labelledby="userDropdown">
                        <li class="dropdown-header">
                            <div class="user-dropdown-header">
                                <i class="fas fa-user-circle fa-2x"></i>
                                <div>
                                    <strong><?php echo htmlspecialchars($current_user['full_name']); ?></strong>
                                    <small><?php echo htmlspecialchars($current_user['username']); ?></small>
                                </div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="activity-log.php"><i class="fas fa-history me-2"></i>Activity Log</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="../core/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Main Content -->
    <main class="container-fluid py-4">
        <!-- Beautiful Page Header -->
        <div class="beautiful-page-header mb-5">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="header-content">
                            <h1 class="page-title-beautiful">
                                <i class="fas fa-hand-holding-usd me-3"></i>
                                Loan Accounting
                            </h1>
                            <p class="page-subtitle-beautiful">
                                Monitor and manage loan records and calculations
                            </p>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <div class="header-info-card">
                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="fas fa-database"></i>
                                </div>
                                <div class="info-content">
                                    <div class="info-label">Database Status</div>
                                    <div class="info-value status-connected">Connected</div>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <div class="info-content">
                                    <div class="info-label">Current Period</div>
                                    <div class="info-value"><?php echo date('F Y'); ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="header-actions mt-3">
                    <a href="../core/dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
        
        <div class="container">
        
        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-3 col-sm-6">
                <div class="stat-card stat-card-primary">
                    <div class="stat-icon">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $totalLoans; ?></h3>
                        <p>Total Loans</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card stat-card-success">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $activeLoans; ?></h3>
                        <p>Active Loans</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card stat-card-info">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <h3>₱<?php echo number_format($totalAmount, 2); ?></h3>
                        <p>Total Amount</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card stat-card-warning">
                    <div class="stat-icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="stat-content">
                        <h3>₱<?php echo number_format($totalOutstanding, 2); ?></h3>
                        <p>Outstanding Balance</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <button type="button" class="btn btn-primary" id="btnShowFilters">
                            <i class="fas fa-filter me-1"></i>Apply Filters
                        </button>
                        <?php if ($applyFilters): ?>
                        <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                            <i class="fas fa-times me-1"></i>Clear Filters
                        </button>
                        <?php endif; ?>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-success" onclick="viewAuditTrail()">
                            <i class="fas fa-history me-1"></i>Audit Trail
                        </button>
                        <button type="button" class="btn btn-info" onclick="exportToExcel()">
                            <i class="fas fa-file-excel me-1"></i>Export
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="printTable()">
                            <i class="fas fa-print me-1"></i>Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Filter Panel -->
        <div class="card mb-4" id="filterPanel" style="display: <?php echo $applyFilters ? 'block' : 'none'; ?>;">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Loan Filters</h5>
            </div>
            <div class="card-body">
                <form method="GET" action="">
                    <input type="hidden" name="apply_filters" value="1">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Date From</label>
                            <input type="date" class="form-control" name="date_from" value="<?php echo htmlspecialchars($dateFrom); ?>">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Date To</label>
                            <input type="date" class="form-control" name="date_to" value="<?php echo htmlspecialchars($dateTo); ?>">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" name="status">
                                <option value="">All Status</option>
                                <option value="pending" <?php echo $status === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="active" <?php echo $status === 'active' ? 'selected' : ''; ?>>Active</option>
                                <option value="paid" <?php echo $status === 'paid' ? 'selected' : ''; ?>>Paid</option>
                                <option value="defaulted" <?php echo $status === 'defaulted' ? 'selected' : ''; ?>>Defaulted</option>
                                <option value="cancelled" <?php echo $status === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Loan Number</label>
                            <input type="text" class="form-control" name="account_number" 
                                   placeholder="Search by loan number..." 
                                   value="<?php echo htmlspecialchars($accountNumber); ?>">
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary me-2">
                                <i class="fas fa-search me-1"></i>Apply Filters
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                                <i class="fas fa-times me-1"></i>Clear All
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Loan History Table -->
        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0"><i class="fas fa-table me-2"></i>Loan History</h5>
            </div>
            <!-- Print Title - Only visible when printing -->
            <div class="print-title d-none">
                <h2 class="text-center mb-3">LOAN HISTORY REPORT</h2>
                <p class="text-center text-muted mb-4">Generated on <?php echo date('F d, Y'); ?></p>
            </div>
            <div class="card-body">
                <?php if ($applyFilters && !$hasResults): ?>
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>No Existing Information Found</h4>
                    <p>No loans match your filter criteria. Try adjusting your filters.</p>
                    <button class="btn btn-primary mt-3" onclick="clearFilters()">
                        <i class="fas fa-times me-1"></i>Clear Filters
                    </button>
                </div>
                <?php elseif ($hasResults): ?>
                <div class="table-responsive">
                    <table id="loanTable" class="table table-hover table-striped">
                        <thead class="table-light">
                            <tr>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Loan No.</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Borrower</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Loan Type</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Start Date</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Maturity Date</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Loan Amount</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Interest Rate</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Outstanding</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Status</th>
                                <th style="background-color: #f8f9fa; color: #0A3D3D; font-weight: 600;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($loans as $loan): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($loan['loan_number']); ?></strong></td>
                                <td><?php echo htmlspecialchars($loan['borrower_name']); ?></td>
                                <td><?php echo htmlspecialchars($loan['loan_type_name'] ?? 'N/A'); ?></td>
                                <td><?php echo date('M d, Y', strtotime($loan['start_date'])); ?></td>
                                <td><?php echo date('M d, Y', strtotime($loan['maturity_date'])); ?></td>
                                <td class="text-end">₱<?php echo number_format($loan['loan_amount'], 2); ?></td>
                                <td class="text-center"><?php echo number_format($loan['interest_rate'], 2); ?>%</td>
                                <td class="text-end">₱<?php echo number_format($loan['outstanding_balance'], 2); ?></td>
                                <td>
                                    <span class="badge status-<?php echo strtolower($loan['status']); ?>">
                                        <?php echo ucfirst($loan['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-info btn-action" onclick="viewLoanDetails(<?php echo $loan['id']; ?>)" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-danger btn-action" onclick="deleteLoan(<?php echo $loan['id']; ?>)" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php else: ?>
                <div class="empty-state">
                    <i class="fas fa-hand-holding-usd"></i>
                    <h4>No Loan Data Available</h4>
                    <p>Start by creating loan records or applying filters to view existing loans.</p>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        </div>
    </main>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <p class="mb-0">&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
        </div>
    </footer>
    
    <!-- Loan Details Modal -->
    <div class="modal fade" id="loanDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-file-invoice-dollar me-2"></i>Loan Details</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="loanDetailsBody">
                    <!-- Content loaded via JavaScript -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Audit Trail Modal -->
    <div class="modal fade" id="auditTrailModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-history me-2"></i>Loan Audit Trail</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Loan No.</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody id="auditTrailBody">
                                <!-- Content loaded via JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" onclick="exportAuditTrail()">
                        <i class="fas fa-file-excel me-1"></i>Export Audit Trail
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
    <!-- Custom JS -->
    <script src="../assets/js/loan-accounting.js"></script>
    <script src="../assets/js/notifications.js"></script>
</body>
</html>
