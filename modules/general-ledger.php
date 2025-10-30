<?php
require_once '../config/database.php';
require_once '../includes/session.php';

requireLogin();
$current_user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>General Ledger - Accounting and Finance System</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/general-ledger.css">
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
                        <a class="nav-link dropdown-toggle active" href="#" id="modulesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-th-large me-1"></i>Modules
                        </a>
                        <ul class="dropdown-menu dropdown-menu-custom" aria-labelledby="modulesDropdown">
                            <li><a class="dropdown-item active" href="general-ledger.php"><i class="fas fa-book me-2"></i>General Ledger</a></li>
                            <li><a class="dropdown-item" href="financial-reporting.php"><i class="fas fa-chart-line me-2"></i>Financial Reporting</a></li>
                            <li><a class="dropdown-item" href="loan-accounting.php"><i class="fas fa-hand-holding-usd me-2"></i>Loan Accounting</a></li>
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
                        <li><a class="dropdown-item notification-item" href="#">
                            <i class="fas fa-info-circle text-info"></i>
                            <div class="notification-content">
                                <strong>New Report Available</strong>
                                <small>Monthly financial report is ready</small>
                            </div>
                        </a></li>
                        <li><a class="dropdown-item notification-item" href="#">
                            <i class="fas fa-exclamation-triangle text-warning"></i>
                            <div class="notification-content">
                                <strong>Pending Approvals</strong>
                                <small>2 expense reports need review</small>
                            </div>
                        </a></li>
                        <li><a class="dropdown-item notification-item" href="#">
                            <i class="fas fa-check-circle text-success"></i>
                            <div class="notification-content">
                                <strong>Payroll Processed</strong>
                                <small>October payroll completed</small>
                            </div>
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-center small" href="#">View All Notifications</a></li>
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
    <main class="gl-main-content">
        <div class="container-xl gl-content-wrapper">
            <!-- Page Header -->
            <header class="gl-page-header">
                <div class="gl-breadcrumb" aria-label="Breadcrumb">
                    <a href="../core/dashboard.php" class="gl-breadcrumb__link">
                        <i class="fas fa-home me-2"></i>
                        <span>Dashboard</span>
                    </a>
                    <span class="gl-breadcrumb__separator" aria-hidden="true">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <span class="gl-breadcrumb__item">Modules</span>
                    <span class="gl-breadcrumb__separator" aria-hidden="true">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <span class="gl-breadcrumb__item gl-breadcrumb__item--current">General Ledger</span>
                </div>

                <div class="gl-header-main">
                    <div class="gl-header-text">
                        <h1 class="page-title">General Ledger</h1>
                        <p class="page-subtitle">Monitor ledger health, track movements, and stay audit-ready with a curated snapshot of every critical activity.</p>
                        <div class="gl-header-links">
                            <a class="btn-link" href="../core/dashboard.php">
                                <i class="fas fa-arrow-left"></i>
                                <span>Back to dashboard</span>
                            </a>
                        </div>
                    </div>
                    <div class="gl-header-actions">
                        <button class="btn-gl-outline" type="button" onclick="scrollToSection('accounts')">
                            <i class="fas fa-layer-group"></i>
                            <span>Chart of accounts</span>
                        </button>
                        <button class="btn-gl-primary" type="button" onclick="scrollToSection('transactions')">
                            <i class="fas fa-file-invoice-dollar"></i>
                            <span>Review transactions</span>
                        </button>
                    </div>
                </div>

                <nav class="gl-quick-nav" aria-label="Ledger quick links">
                    <button class="gl-quick-nav__item" type="button" onclick="scrollToSection('accounts')">
                        <i class="fas fa-table"></i>
                        <span>Accounts</span>
                    </button>
                    <button class="gl-quick-nav__item" type="button" onclick="scrollToSection('transactions')">
                        <i class="fas fa-shuffle"></i>
                        <span>Transactions</span>
                    </button>
                    <button class="gl-quick-nav__item" type="button" onclick="scrollToSection('audit')">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Audit trail</span>
                    </button>
                    <button class="gl-quick-nav__item" type="button" onclick="scrollToSection('adjustments')">
                        <i class="fas fa-adjust"></i>
                        <span>Adjustments</span>
                    </button>
                </nav>
            </header>

            <!-- Statistics Cards -->
            <div class="gl-stats-section">
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-list-alt"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-accounts">Loading...</h3>
                                <p>Total Accounts</p>
                                <a href="#accounts" class="stat-link">View Details</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-transactions">Loading...</h3>
                                <p>Total Transactions</p>
                                <a href="#transactions" class="stat-link">View Details</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-history"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-audit">Loading...</h3>
                                <p>Total Audit Entries</p>
                                <a href="#audit" class="stat-link">View Details</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-adjustments">Loading...</h3>
                                <p>Total Adjustments</p>
                                <a href="#adjustments" class="stat-link">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Overview -->
            <div class="gl-section">
                <div class="section-header">
                    <h2>Charts Overview</h2>
                    <p>Visual representation of your financial data</p>
                </div>
                <div class="chart-grid">
                    <div class="chart-container">
                        <h4>Account Type Distribution</h4>
                        <div class="chart-wrapper">
                            <canvas id="accountTypesChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4>Transaction Summary by Category</h4>
                        <div class="chart-wrapper">
                            <canvas id="transactionSummaryChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="chart-actions">
                    <button class="btn-chart" onclick="applyChartFilters()">Apply Filters</button>
                    <button class="btn-chart-outline" onclick="viewDrillDown()">View Drill-Down Details</button>
                </div>
            </div>

            <!-- Accounts Table -->
            <div class="gl-section" id="accounts">
                <div class="section-header">
                    <h2>Accounts Table</h2>
                    <p>List of financial accounts with balances</p>
                </div>
                <div class="gl-toolbar" role="search" aria-label="Account search and filters">
                    <div class="gl-toolbar__field">
                        <label for="account-search" class="visually-hidden">Search accounts</label>
                        <span class="gl-toolbar__icon"><i class="fas fa-search"></i></span>
                        <input type="text" class="search-input" placeholder="Search accounts" id="account-search" autocomplete="off">
                    </div>
                    <div class="gl-toolbar__actions">
                        <button class="btn-filter" type="button" onclick="applyAccountFilter()">
                            <i class="fas fa-filter"></i>
                            <span>Apply filter</span>
                        </button>
                        <button class="btn-reset" type="button" onclick="resetAccountFilter()">
                            <i class="fas fa-rotate-left"></i>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="gl-table" id="accounts-table">
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th>Type</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="5" class="text-center">
                                    <div class="loading-spinner"></div>
                                    <p>Loading accounts...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="table-actions-row">
                    <span class="table-actions-hint">Showing the latest 10 active accounts</span>
                    <div class="table-actions">
                        <button class="btn-action btn-action-outline" type="button" onclick="exportAccounts()">Export</button>
                        <button class="btn-action" type="button" onclick="loadAccountsTable()">Refresh</button>
                    </div>
                </div>
            </div>

            <!-- Transaction Records -->
            <div class="gl-section" id="transactions">
                <div class="section-header">
                    <h2>Transaction Records</h2>
                    <p>Detailed transaction history and filters</p>
                </div>
                <div class="gl-toolbar gl-toolbar--split" role="search" aria-label="Transaction filters">
                    <div class="gl-toolbar__group">
                        <div class="gl-toolbar__field gl-toolbar__field--compact">
                            <label for="transaction-from">From</label>
                            <input type="date" id="transaction-from" class="gl-input">
                        </div>
                        <div class="gl-toolbar__field gl-toolbar__field--compact">
                            <label for="transaction-to">To</label>
                            <input type="date" id="transaction-to" class="gl-input">
                        </div>
                        <div class="gl-toolbar__field gl-toolbar__field--compact">
                            <label for="transaction-type">Type</label>
                            <select id="transaction-type" class="gl-select">
                                <option value="">All types</option>
                                <option value="sale">Sales</option>
                                <option value="purchase">Purchases</option>
                                <option value="payment">Payments</option>
                                <option value="receipt">Receipts</option>
                                <option value="adjustment">Adjustments</option>
                            </select>
                        </div>
                    </div>
                    <div class="gl-toolbar__actions">
                        <button class="btn-filter" type="button" onclick="applyTransactionFilter()">
                            <i class="fas fa-sliders-h"></i>
                            <span>Apply</span>
                        </button>
                        <button class="btn-reset" type="button" onclick="resetTransactionFilter()">
                            <i class="fas fa-rotate-left"></i>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="gl-table" id="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" class="text-center">
                                    <div class="loading-spinner"></div>
                                    <p>Loading transactions...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="table-actions-row">
                    <span class="table-actions-hint">Latest journal entries posted to the ledger</span>
                    <div class="table-actions">
                        <button class="btn-action btn-action-outline" type="button" onclick="exportTransactions()">Export</button>
                        <button class="btn-action btn-action-outline" type="button" onclick="printTransactions()">Print</button>
                        <button class="btn-action" type="button" onclick="refreshTransactions()">Refresh</button>
                    </div>
                </div>
            </div>

            <!-- Audit Trail -->
            <div class="gl-section" id="audit">
                <div class="section-header">
                    <h2>Audit Trail</h2>
                    <p>Track all system activities and changes</p>
                </div>
                <div class="chart-grid">
                    <div class="chart-container">
                        <h4>Account Type Distribution</h4>
                        <div class="chart-wrapper">
                            <canvas id="auditAccountTypesChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4>Transaction Summary by Category</h4>
                        <div class="chart-wrapper">
                            <canvas id="auditTransactionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="gl-section gl-section--minimal">
                <div class="section-header">
                    <h2>Recent Transactions</h2>
                </div>
                <div class="table-container">
                    <table class="gl-table" id="recent-transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>TXN-2024-001</td>
                                <td>Office Supplies Purchase</td>
                                <td>$2,450.00</td>
                                <td>Jan 15, 2024</td>
                                <td>Debit</td>
                            </tr>
                            <tr>
                                <td>TXN-2024-002</td>
                                <td>Client Payment Received</td>
                                <td>$15,750.00</td>
                                <td>Jan 14, 2024</td>
                                <td>Credit</td>
                            </tr>
                            <tr>
                                <td>TXN-2024-003</td>
                                <td>Utility Bill Payment</td>
                                <td>$1,250.00</td>
                                <td>Jan 13, 2024</td>
                                <td>Debit</td>
                            </tr>
                            <tr>
                                <td>TXN-2024-004</td>
                                <td>Equipment Lease Payment</td>
                                <td>$3,200.00</td>
                                <td>Jan 12, 2024</td>
                                <td>Debit</td>
                            </tr>
                            <tr>
                                <td>TXN-2024-005</td>
                                <td>Service Revenue</td>
                                <td>$8,900.00</td>
                                <td>Jan 11, 2024</td>
                                <td>Credit</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Adjustments Section -->
            <div class="gl-section" id="adjustments">
                <div class="section-header">
                    <h2>Adjustments</h2>
                    <p>Keep track of manual corrections and pending approvals.</p>
                </div>
                <div class="adjustments-grid">
                    <article class="adjustment-card adjustment-card--pending">
                        <span class="adjustment-card__badge"><i class="fas fa-clock"></i> Pending review</span>
                        <h3>Quarter-End Accruals</h3>
                        <p>Preview the depreciation and accrual entries prepared for the close period.</p>
                        <dl class="adjustment-card__meta">
                            <div>
                                <dt>Prepared by</dt>
                                <dd>Maria Santos</dd>
                            </div>
                            <div>
                                <dt>Due date</dt>
                                <dd>Oct 31, 2025</dd>
                            </div>
                        </dl>
                        <button class="btn-gl-outline" type="button" onclick="showNotification('Opening adjustment packet...', 'info')">
                            View packet
                        </button>
                    </article>
                    <article class="adjustment-card adjustment-card--in-review">
                        <span class="adjustment-card__badge"><i class="fas fa-search"></i> In review</span>
                        <h3>Payroll Corrections</h3>
                        <p>Verify reclassified payroll expenses between cost centers before posting.</p>
                        <dl class="adjustment-card__meta">
                            <div>
                                <dt>Reviewer</dt>
                                <dd>Gerald Cruz</dd>
                            </div>
                            <div>
                                <dt>Impact</dt>
                                <dd>₱82,450.00</dd>
                            </div>
                        </dl>
                        <button class="btn-gl-outline" type="button" onclick="showNotification('Sending reminder to reviewer...', 'info')">
                            Send reminder
                        </button>
                    </article>
                    <article class="adjustment-card adjustment-card--approved">
                        <span class="adjustment-card__badge"><i class="fas fa-check"></i> Approved</span>
                        <h3>Inventory True-Up</h3>
                        <p>Adjustments for stock variance reconciled with the warehouse audit report.</p>
                        <dl class="adjustment-card__meta">
                            <div>
                                <dt>Approved by</dt>
                                <dd>Louise Tan</dd>
                            </div>
                            <div>
                                <dt>Posted on</dt>
                                <dd>Oct 11, 2025</dd>
                            </div>
                        </dl>
                        <button class="btn-gl-outline" type="button" onclick="showNotification('Viewing journal entry AJ-2025-014', 'success')">
                            View journal
                        </button>
                    </article>
                </div>

                <div class="gl-timeline">
                    <div class="gl-timeline__item">
                        <div class="gl-timeline__title">AJ-2025-016 &middot; Outstanding</div>
                        <p class="gl-timeline__description">Waiting for CFO sign-off on marketing accrual reversal.</p>
                        <span class="gl-timeline__meta">Last updated 2 hours ago</span>
                    </div>
                    <div class="gl-timeline__item">
                        <div class="gl-timeline__title">AJ-2025-010 &middot; Posted</div>
                        <p class="gl-timeline__description">Foreign exchange revaluation completed by Treasury.</p>
                        <span class="gl-timeline__meta">Posted Oct 12, 2025 at 09:45 AM</span>
                    </div>
                    <div class="gl-timeline__item">
                        <div class="gl-timeline__title">AJ-2025-008 &middot; Voided</div>
                        <p class="gl-timeline__description">Superseded by AJ-2025-009 after supplier correction.</p>
                        <span class="gl-timeline__meta">Updated Oct 09, 2025 at 03:22 PM</span>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="gl-footer">
        <p>&copy; 2025 Evergreen Accounting & Finance. All rights reserved.</p>
    </footer>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <!-- Custom JS -->
    <script src="../assets/js/general-ledger.js"></script>
</body>
</html>
