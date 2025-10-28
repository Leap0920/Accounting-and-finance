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
                        <a class="nav-link" href="../core/dashboard.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="#">Modules</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Settings</a>
                    </li>
                </ul>
            </div>
            
            <div class="d-flex align-items-center gap-3">
                <div class="notification-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="dropdown">
                    <a class="user-profile-btn" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle"></i>
                        <span class="ms-2">System Administrator</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="../core/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Main Content -->
    <main class="gl-main-content">
        <div class="container-fluid">
            <!-- Page Header -->
            <div class="gl-page-header">
                <div class="row w-100">
                    <div class="col-md-8">
                        <h1 class="page-title">GENERAL LEDGER</h1>
                        <p class="page-subtitle">Comprehensive view and control of ledger data, charts, transactions, audit trails, and adjustments.</p>
                        <button class="btn-gl-secondary mt-2" onclick="window.location.href='../core/dashboard.php'">
                            Go to Dashboard
                        </button>
                    </div>
                    <div class="col-md-4">
                        <div class="header-buttons-group">
                            <button class="btn-gl-primary-sm" onclick="scrollToSection('accounts')">
                                Go to Accounts
                            </button>
                            <button class="btn-gl-primary-sm" onclick="scrollToSection('transactions')">
                                Go to Transactions
                            </button>
                            <button class="btn-gl-primary-sm" onclick="scrollToSection('audit')">
                                Go to Audit Trails
                            </button>
                            <button class="btn-gl-primary-sm" onclick="scrollToSection('adjustments')">
                                Go to Adjustments
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="gl-stats-section">
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-list-alt"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-accounts">247</h3>
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
                                <h3 id="total-transactions">1,542</h3>
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
                                <h3 id="total-audit">89</h3>
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
                                <h3 id="total-adjustments">23</h3>
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
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="chart-container">
                            <h4>Account Type Distribution</h4>
                            <div class="chart-wrapper">
                                <canvas id="accountTypesChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="chart-container">
                            <h4>Transaction Summary by Category</h4>
                            <div class="chart-wrapper">
                                <canvas id="transactionSummaryChart"></canvas>
                            </div>
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
                <div class="table-controls">
                    <input type="text" class="search-input" placeholder="Search accounts..." id="account-search">
                    <button class="btn-filter" onclick="applyAccountFilter()">Apply Filter</button>
                    <button class="btn-reset" onclick="resetAccountFilter()">Reset Filter</button>
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
                    <button class="btn-action" onclick="viewAccount()">View</button>
                    <button class="btn-action" onclick="viewAccount()">View</button>
                    <button class="btn-action" onclick="viewAccount()">View</button>
                </div>
            </div>

            <!-- Transaction Records -->
            <div class="gl-section" id="transactions">
                <div class="section-header">
                    <h2>Transaction Records</h2>
                    <p>Detailed transaction history and filters</p>
                </div>
                <div class="transaction-filters">
                    <button class="btn-filter" onclick="applyTransactionFilter()">Apply</button>
                    <button class="btn-reset" onclick="resetTransactionFilter()">Reset</button>
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
                    <button class="btn-action" onclick="viewTransaction()">View</button>
                    <button class="btn-action" onclick="viewTransaction()">View</button>
                </div>
            </div>

            <!-- Audit Trail -->
            <div class="gl-section" id="audit">
                <div class="section-header">
                    <h2>Audit Trail</h2>
                    <p>Track all system activities and changes</p>
                </div>
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="chart-container">
                            <h4>Account Type Distribution</h4>
                            <div class="chart-wrapper">
                                <canvas id="auditAccountTypesChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="chart-container">
                            <h4>Transaction Summary by Category</h4>
                            <div class="chart-wrapper">
                                <canvas id="auditTransactionChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="gl-section">
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
