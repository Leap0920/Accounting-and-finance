<?php
require_once '../config/database.php';
require_once '../includes/session.php';

requireLogin();
$current_user = getCurrentUser();

// Initialize filter variables
$filter_date_from = $_GET['date_from'] ?? '';
$filter_date_to = $_GET['date_to'] ?? '';
$filter_type = $_GET['type'] ?? '';
$filter_status = $_GET['status'] ?? '';
$filter_account = $_GET['account'] ?? '';
$apply_filters = isset($_GET['apply_filters']);

// Sample data structure - will be replaced with actual database queries
$transactions = [];
$hasFilters = false;

if ($apply_filters) {
    $hasFilters = !empty($filter_date_from) || !empty($filter_date_to) || 
                  !empty($filter_type) || !empty($filter_status) || !empty($filter_account);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Recording - Accounting and Finance System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/transaction-reading.css">
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
                            <i class="fas fa-exchange-alt me-1"></i>Transaction Recording
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
    <div class="page-header">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h2><i class="fas fa-exchange-alt me-2"></i>TRANSACTION RECORDING</h2>
                </div>
                <div class="col-md-6 text-end">
                    <a href="../core/dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Main Content -->
    <main class="container-fluid py-4">
        <!-- Action Buttons -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <h5 class="mb-0"><i class="fas fa-list-alt me-2 text-primary"></i>Transaction History</h5>
                    </div>
                    <div class="col-md-6 text-end">
                        <button type="button" class="btn btn-primary me-2" id="btnShowFilters">
                            <i class="fas fa-filter me-1"></i>Apply Filters
                        </button>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-success" onclick="exportToExcel()">
                                <i class="fas fa-file-excel me-1"></i>Export Excel
                            </button>
                            <button type="button" class="btn btn-info" onclick="printTable()">
                                <i class="fas fa-print me-1"></i>Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Filter Panel -->
        <div class="card shadow-sm mb-4" id="filterPanel" style="display: none;">
            <div class="card-header bg-primary text-white">
                <h6 class="mb-0"><i class="fas fa-filter me-2"></i>Filter Transactions</h6>
            </div>
            <div class="card-body">
                <form method="GET" action="" id="filterForm">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label for="date_from" class="form-label">Date From</label>
                            <input type="date" class="form-control" id="date_from" name="date_from" value="<?php echo htmlspecialchars($filter_date_from); ?>">
                        </div>
                        <div class="col-md-3">
                            <label for="date_to" class="form-label">Date To</label>
                            <input type="date" class="form-control" id="date_to" name="date_to" value="<?php echo htmlspecialchars($filter_date_to); ?>">
                        </div>
                        <div class="col-md-2">
                            <label for="type" class="form-label">Transaction Type</label>
                            <select class="form-select" id="type" name="type">
                                <option value="">All Types</option>
                                <option value="GJ" <?php echo $filter_type === 'GJ' ? 'selected' : ''; ?>>General Journal</option>
                                <option value="CR" <?php echo $filter_type === 'CR' ? 'selected' : ''; ?>>Cash Receipt</option>
                                <option value="CD" <?php echo $filter_type === 'CD' ? 'selected' : ''; ?>>Cash Disbursement</option>
                                <option value="PR" <?php echo $filter_type === 'PR' ? 'selected' : ''; ?>>Payroll</option>
                                <option value="AP" <?php echo $filter_type === 'AP' ? 'selected' : ''; ?>>Accounts Payable</option>
                                <option value="AR" <?php echo $filter_type === 'AR' ? 'selected' : ''; ?>>Accounts Receivable</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="">All Status</option>
                                <option value="draft" <?php echo $filter_status === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                <option value="posted" <?php echo $filter_status === 'posted' ? 'selected' : ''; ?>>Posted</option>
                                <option value="reversed" <?php echo $filter_status === 'reversed' ? 'selected' : ''; ?>>Reversed</option>
                                <option value="voided" <?php echo $filter_status === 'voided' ? 'selected' : ''; ?>>Voided</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="account" class="form-label">Account Number</label>
                            <input type="text" class="form-control" id="account" name="account" placeholder="e.g., 1001" value="<?php echo htmlspecialchars($filter_account); ?>">
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12 text-end">
                            <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                                <i class="fas fa-times me-1"></i>Clear Filters
                            </button>
                            <button type="submit" name="apply_filters" class="btn btn-primary">
                                <i class="fas fa-search me-1"></i>Apply Filters
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- No Results Message -->
        <?php if ($apply_filters && $hasFilters && empty($transactions)): ?>
        <div class="alert alert-warning shadow-sm" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>No Existing Information Found</strong><br>
            No transactions match your filter criteria. Please adjust your filters and try again.
        </div>
        <?php endif; ?>
        
        <!-- Transaction Table -->
        <div class="card shadow-sm">
            <div class="card-header bg-white">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h6 class="mb-0">
                            <?php echo $apply_filters && $hasFilters ? 'Filtered Transaction History' : 'All Transaction Records'; ?>
                        </h6>
                    </div>
                    <?php if ($apply_filters && $hasFilters): ?>
                    <div class="col-md-6 text-end">
                        <span class="badge bg-info">
                            <i class="fas fa-filter me-1"></i>Filters Applied
                        </span>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="transactionTable" class="table table-hover table-striped align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th>Journal No.</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Reference</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Data will be populated by DataTables or database -->
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="5" class="text-end">Total:</th>
                                <th>0.00</th>
                                <th>0.00</th>
                                <th colspan="3"></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="row mt-4">
            <div class="col-md-3">
                <div class="stat-card stat-card-primary">
                    <div class="stat-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="totalTransactions">0</h3>
                        <p>Total Transactions</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card stat-card-success">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="postedTransactions">0</h3>
                        <p>Posted</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card stat-card-warning">
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="draftTransactions">0</h3>
                        <p>Draft</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card stat-card-info">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="todayTransactions">0</h3>
                        <p>Today's Transactions</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Audit Trail Modal -->
    <div class="modal fade" id="auditTrailModal" tabindex="-1" aria-labelledby="auditTrailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="auditTrailModalLabel">
                        <i class="fas fa-history me-2"></i>Audit Trail
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Object Type</th>
                                    <th>Object ID</th>
                                    <th>IP Address</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="auditTrailBody">
                                <tr>
                                    <td colspan="7" class="text-center text-muted">
                                        No audit trail data available.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="exportAuditTrail()">
                        <i class="fas fa-download me-1"></i>Export Audit Trail
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Transaction Details Modal -->
    <div class="modal fade" id="transactionDetailsModal" tabindex="-1" aria-labelledby="transactionDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="transactionDetailsModalLabel">
                        <i class="fas fa-file-invoice me-2"></i>Transaction Details
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="transactionDetailsBody">
                    <p class="text-center text-muted">Loading transaction details...</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-info" onclick="viewAuditTrail()">
                        <i class="fas fa-history me-1"></i>View Audit Trail
                    </button>
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
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
    <!-- Custom JS -->
    <script src="../assets/js/dashboard.js"></script>
    <script src="../assets/js/transaction-reading.js"></script>
</body>
</html>
