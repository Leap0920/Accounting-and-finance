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
    <title>Financial Reporting & Compliance - Accounting and Finance System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/financial-reporting.css">
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
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="fas fa-chart-line me-1"></i>Financial Reporting
                        </a>
                    </li>
                </ul>
            </div>
            
            <div class="d-flex align-items-center gap-3">
                <span class="user-info d-none d-lg-inline">
                    <i class="fas fa-user-circle me-2"></i><?php echo htmlspecialchars($current_user['full_name']); ?>
                </span>
                <a href="../core/logout.php" class="btn btn-logout">
                    <i class="fas fa-sign-out-alt me-1"></i>Logout
                </a>
            </div>
        </div>
    </nav>
    
    <!-- Page Header -->
    <div class="page-header-simple">
        <div class="container-fluid">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <h2><i class="fas fa-chart-line me-3"></i>Financial Reporting & Compliance</h2>
                </div>
                <a href="../core/dashboard.php" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                </a>
            </div>
        </div>
    </div>
    
    <!-- Main Content -->
    <main class="container-fluid py-4">
        <!-- Modern Tab Navigation -->
        <div class="modern-tabs-container">
            <ul class="nav nav-pills modern-nav-tabs" id="reportTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="financial-reports-tab" data-bs-toggle="pill" data-bs-target="#financial-reports" type="button" role="tab">
                        <i class="fas fa-file-invoice-dollar me-2"></i>FINANCIAL REPORTS
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="compliance-tab" data-bs-toggle="pill" data-bs-target="#compliance" type="button" role="tab">
                        <i class="fas fa-check-circle me-2"></i>COMPLIANCE
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tax-reports-tab" data-bs-toggle="pill" data-bs-target="#tax-reports" type="button" role="tab">
                        <i class="fas fa-file-invoice me-2"></i>TAX REPORTS
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="audit-trail-tab" data-bs-toggle="pill" data-bs-target="#audit-trail" type="button" role="tab">
                        <i class="fas fa-history me-2"></i>AUDIT TRAIL
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="report-settings-tab" data-bs-toggle="pill" data-bs-target="#report-settings" type="button" role="tab">
                        <i class="fas fa-cog me-2"></i>REPORT SETTINGS
                    </button>
                </li>
            </ul>
        </div>

        <div class="tab-content mt-4" id="reportTabsContent">
            <!-- FINANCIAL REPORTS TAB -->
            <div class="tab-pane fade show active" id="financial-reports" role="tabpanel">
                <div class="section-header">
                    <h4>Standard Financial Reports</h4>
                </div>

                <div class="report-cards-grid">
                    <!-- Balance Sheet Card -->
                    <div class="report-card">
                        <div class="report-card-icon">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <h5>Balance Sheet</h5>
                        <p class="report-description">Assets, Liabilities, and Equity</p>
                        <button class="btn btn-generate" onclick="openReportModal('balance-sheet')">GENERATE</button>
                    </div>

                    <!-- Income Statement Card -->
                    <div class="report-card">
                        <div class="report-card-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h5>Income Statement</h5>
                        <p class="report-description">Revenue, expenses, and Net income</p>
                        <button class="btn btn-generate" onclick="openReportModal('income-statement')">GENERATE</button>
                    </div>

                    <!-- Cash Flow Statement Card -->
                    <div class="report-card">
                        <div class="report-card-icon">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <h5>Cash Flow Statement</h5>
                        <p class="report-description">Operating, Investing, and Financing Activities</p>
                        <button class="btn btn-generate" onclick="openReportModal('cash-flow')">GENERATE</button>
                    </div>

                    <!-- Trial Balance Card -->
                    <div class="report-card">
                        <div class="report-card-icon">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <h5>Trial Balance</h5>
                        <p class="report-description">Account Balances and Totals</p>
                        <button class="btn btn-generate" onclick="openReportModal('trial-balance')">GENERATE</button>
                    </div>
                </div>
            </div>

            <!-- COMPLIANCE TAB -->
            <div class="tab-pane fade" id="compliance" role="tabpanel">
                <div class="section-header">
                    <h4>Regulatory Compliance</h4>
                </div>

                <!-- Compliance Status Cards -->
                <div class="compliance-cards-row">
                    <div class="compliance-status-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6>GAAP Compliance</h6>
                            <span class="badge badge-compliant">Compliant</span>
                        </div>
                    </div>

                    <div class="compliance-status-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6>SOX Compliance</h6>
                            <span class="badge badge-compliant">Compliant</span>
                        </div>
                    </div>

                    <div class="compliance-status-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6>SOX Compliance</h6>
                            <span class="badge badge-review">Review Needed</span>
                        </div>
                    </div>
                </div>

                <!-- Compliance Reports Table -->
                <div class="section-header mt-5">
                    <h4>Compliance Reports</h4>
                    <button class="btn btn-primary" onclick="generateComplianceReport()">
                        <i class="fas fa-file-alt me-2"></i>Generate Compliance Reports
                    </button>
                </div>

                <div class="table-container">
                    <table class="table modern-table">
                        <thead>
                            <tr>
                                <th>Report Type</th>
                                <th>Period</th>
                                <th>Generated Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="complianceReportsTable">
                            <tr>
                                <td colspan="5" class="text-center text-muted py-5">
                                    <i class="fas fa-folder-open fa-3x mb-3 d-block"></i>
                                    No compliance reports generated yet. Click "Generate Compliance Reports" to create one.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAX REPORTS TAB -->
            <div class="tab-pane fade" id="tax-reports" role="tabpanel">
                <div class="section-header">
                    <h4>Tax Reporting</h4>
                </div>

                <div class="report-cards-grid">
                    <!-- Income Tax Report -->
                    <div class="report-card">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="report-card-icon-small">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <span class="badge badge-due-soon">Due Soon</span>
                        </div>
                        <h5>Income Tax Report</h5>
                        <div class="report-details">
                            <p>Annual Income Tax Return</p>
                            <p>Filing Deadline:</p>
                            <p>Estimated Tax:</p>
                        </div>
                        <button class="btn btn-generate mt-3" onclick="openTaxReportModal('income-tax')">GENERATE</button>
                    </div>

                    <!-- Payroll Tax Report -->
                    <div class="report-card">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="report-card-icon-small">
                                <i class="fas fa-users"></i>
                            </div>
                            <span class="badge badge-current">Current</span>
                        </div>
                        <h5>Payroll Tax Report</h5>
                        <div class="report-details">
                            <p>Quarterly Payroll Tax Returns</p>
                            <p>Next Filing:</p>
                            <p>Total Withheld:</p>
                        </div>
                        <button class="btn btn-generate mt-3" onclick="openTaxReportModal('payroll-tax')">GENERATE</button>
                    </div>

                    <!-- Sales Tax Report -->
                    <div class="report-card">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="report-card-icon-small">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <span class="badge badge-current">Current</span>
                        </div>
                        <h5>Sales Tax Report</h5>
                        <div class="report-details">
                            <p>Monthly Sales Tax Returns</p>
                            <p>Next Filing:</p>
                            <p>Total Collected:</p>
                        </div>
                        <button class="btn btn-generate mt-3" onclick="openTaxReportModal('sales-tax')">GENERATE</button>
                    </div>
                </div>
            </div>

            <!-- AUDIT TRAIL TAB -->
            <div class="tab-pane fade" id="audit-trail" role="tabpanel">
                <div class="section-header">
                    <h4>Audit Trail</h4>
                </div>

                <!-- Audit Trail Filters -->
                <div class="audit-filters">
                    <div class="row g-3">
                        <div class="col-md-2">
                            <input type="date" class="form-control" id="audit-date-from" placeholder="mm/dd/yy">
                        </div>
                        <div class="col-md-2">
                            <input type="date" class="form-control" id="audit-date-to" placeholder="mm/dd/yy">
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="audit-user-filter">
                                <option>All Users</option>
                                <option>Admin</option>
                                <option>Accountant</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="audit-action-filter">
                                <option>All Actions</option>
                                <option>View</option>
                                <option>Generate</option>
                                <option>Export</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Search audit trail..." id="audit-search">
                                <button class="btn btn-primary" onclick="filterAuditTrail()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Audit Trail Table -->
                <div class="table-container mt-4">
                    <table class="table modern-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Module</th>
                                <th>Record ID</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody id="auditTrailTable">
                            <tr>
                                <td colspan="7" class="text-center text-muted py-5">
                                    <i class="fas fa-history fa-3x mb-3 d-block"></i>
                                    No audit records found. Apply filters to view audit trail.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- REPORT SETTINGS TAB -->
            <div class="tab-pane fade" id="report-settings" role="tabpanel">
                <div class="section-header">
                    <h4>Report Configuration</h4>
                </div>

                <div class="settings-container">
                    <div class="row g-4">
                        <!-- Default Settings -->
                        <div class="col-md-6">
                            <div class="settings-card">
                                <label>Default Report Period</label>
                                <select class="form-select" id="default-period">
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="settings-card">
                                <label>Default Format</label>
                                <select class="form-select" id="default-format">
                                    <option>PDF</option>
                                    <option>Excel</option>
                                    <option>CSV</option>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="settings-card">
                                <label>Company Name</label>
                                <input type="text" class="form-control" id="company-name" value="Evergreen">
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="settings-card">
                                <label>Fiscal Year End</label>
                                <input type="date" class="form-control" id="fiscal-year-end" value="2025-12-31">
                            </div>
                        </div>

                        <div class="col-md-12">
                            <div class="settings-card">
                                <label>Report Footer Text</label>
                                <textarea class="form-control" id="footer-text" rows="3" placeholder="Enter custom footer text for reports..."></textarea>
                            </div>
                        </div>

                        <div class="col-md-12">
                            <button class="btn btn-primary btn-lg" onclick="saveSettings()">
                                <i class="fas fa-save me-2"></i>Save Settings
                            </button>
                        </div>
                    </div>

                    <!-- Automated Reports -->
                    <div class="section-header mt-5">
                        <h4>Automated Reports</h4>
                    </div>

                    <div class="automated-reports-list">
                        <div class="automation-item">
                            <div>
                                <h6>Monthly Financial Summary</h6>
                                <p class="text-muted small mb-0">Automatically generate and email reports</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="auto-monthly" checked>
                            </div>
                        </div>

                        <div class="automation-item">
                            <div>
                                <h6>Quarterly Compliance Report</h6>
                                <p class="text-muted small mb-0">Generate compliance reports every quarter</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="auto-quarterly">
                            </div>
                        </div>

                        <div class="automation-item">
                            <div>
                                <h6>Year-end Tax Preparation</h6>
                                <p class="text-muted small mb-0">Prepare all tax documents at year-end</p>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="auto-yearend" checked>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Report Generation Modal -->
    <div class="modal fade" id="reportModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reportModalTitle">Generate Report</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="reportModalContent"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Footer -->
    <footer class="mt-5">
        <div class="container-fluid">
            <p class="mb-0 text-center">&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
        </div>
    </footer>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Custom JS -->
    <script src="../assets/js/dashboard.js"></script>
    <script src="../assets/js/financial-reporting.js"></script>
</body>
</html>
