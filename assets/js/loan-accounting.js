/**
 * Loan Accounting Module JavaScript
 * Handles filtering, export, print, and audit trail functionality
 */

(function() {
    'use strict';

    let dataTable = null;
    let currentLoanId = null;

    /**
     * Initialize when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Check if table has actual data rows (not the "no data" message)
        const hasData = document.querySelector('#loanTable tbody tr') !== null;
        const isEmpty = document.querySelector('.empty-state') !== null;
        
        console.log('Has data:', hasData);
        console.log('Is empty:', isEmpty);
        
        if (hasData && !isEmpty) {
            // Initialize DataTables with existing data
            initDataTable();
        } else {
            console.log('No data found, skipping DataTable initialization');
        }
        
        initEventHandlers();
        checkUrlFilters();
    });

    /**
     * Initialize DataTable with enhanced features
     * Only initialized if table has data rows
     */
    function initDataTable() {
        if (typeof $.fn.dataTable === 'undefined') {
            console.warn('DataTables not loaded');
            return;
        }

        const table = $('#loanTable');
        if (table.length && !$.fn.DataTable.isDataTable('#loanTable')) {
            // Count actual columns in the table
            const columnCount = table.find('thead th').length;
            console.log('Table column count:', columnCount);
            
            // Only initialize if we have the expected number of columns
            if (columnCount === 10) {
                dataTable = table.DataTable({
                    responsive: true,
                    pageLength: 25,
                    order: [[2, 'desc']], // Order by start date descending
                    language: {
                        info: "Showing _START_ to _END_ of _TOTAL_ loans",
                        infoEmpty: "Showing 0 to 0 of 0 loans",
                        infoFiltered: "(filtered from _MAX_ total loans)",
                        lengthMenu: "Show _MENU_ loans per page",
                        search: "Search loans:",
                        zeroRecords: "No matching loans found",
                        emptyTable: "No loan data available"
                    },
                    columnDefs: [
                        { orderable: false, targets: [9] }, // Actions column not sortable
                        { type: 'date', targets: [2, 3] }, // Date columns
                        { className: 'text-end', targets: [4, 6] }, // Amount columns right-aligned
                        { className: 'text-center', targets: [5, 7, 8] } // Rate, Type, Status centered
                    ],
                    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
                });
                console.log('DataTable initialized successfully');
            } else {
                console.warn('Column count mismatch. Expected 10, found:', columnCount);
                console.log('Skipping DataTable initialization to prevent errors');
            }
        }
    }

    /**
     * Initialize all event handlers
     */
    function initEventHandlers() {
        // Show/Hide Filter Panel
        const btnShowFilters = document.getElementById('btnShowFilters');
        const filterPanel = document.getElementById('filterPanel');
        
        if (btnShowFilters && filterPanel) {
            btnShowFilters.addEventListener('click', function() {
                if (filterPanel.style.display === 'none' || !filterPanel.style.display) {
                    filterPanel.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-times me-1"></i>Hide Filters';
                    this.classList.remove('btn-primary');
                    this.classList.add('btn-secondary');
                } else {
                    filterPanel.style.display = 'none';
                    this.innerHTML = '<i class="fas fa-filter me-1"></i>Apply Filters';
                    this.classList.remove('btn-secondary');
                    this.classList.add('btn-primary');
                }
            });
        }

        // Set max date for date inputs to today
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.setAttribute('max', today);
        });
    }

    /**
     * Check if filters are applied via URL and show filter panel
     */
    function checkUrlFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('apply_filters')) {
            const filterPanel = document.getElementById('filterPanel');
            const btnShowFilters = document.getElementById('btnShowFilters');
            
            if (filterPanel && btnShowFilters) {
                filterPanel.style.display = 'block';
                btnShowFilters.innerHTML = '<i class="fas fa-times me-1"></i>Hide Filters';
                btnShowFilters.classList.remove('btn-primary');
                btnShowFilters.classList.add('btn-secondary');
            }
        }
    }

    /**
     * Clear all filters and reload page
     */
    window.clearFilters = function() {
        window.location.href = window.location.pathname;
    };

    /**
     * Export table data to Excel
     */
    window.exportToExcel = function() {
        // Show loading
        showLoading('Preparing Excel export...');

        setTimeout(function() {
            hideLoading();
            showNotification('Excel export feature will be available when connected to database', 'info');
            
            // In production, this would make an AJAX call to generate Excel file
            // fetch('api/loan-data.php?action=export_excel&' + getCurrentFilters())
            //     .then(response => response.blob())
            //     .then(blob => {
            //         const url = window.URL.createObjectURL(blob);
            //         const a = document.createElement('a');
            //         a.href = url;
            //         a.download = 'loans_' + new Date().toISOString().split('T')[0] + '.xlsx';
            //         a.click();
            //         hideLoading();
            //     })
            //     .catch(error => {
            //         hideLoading();
            //         showNotification('Export failed: ' + error.message, 'error');
            //     });
        }, 500);
    };

    /**
     * Print loan table
     */
    window.printTable = function() {
        // Hide filter panel before printing
        const filterPanel = document.getElementById('filterPanel');
        const originalDisplay = filterPanel ? filterPanel.style.display : '';
        
        if (filterPanel) {
            filterPanel.style.display = 'none';
        }

        // Print
        window.print();

        // Restore filter panel display
        if (filterPanel) {
            filterPanel.style.display = originalDisplay;
        }
    };

    /**
     * View loan details
     */
    window.viewLoanDetails = function(loanId) {
        currentLoanId = loanId;
        
        const modal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
        const modalBody = document.getElementById('loanDetailsBody');
        
        // Show loading state
        modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading loan details...</p></div>';
        
        modal.show();
        
        // Fetch loan details from API
        fetch('api/loan-data.php?action=get_loan_details&id=' + loanId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayLoanDetails(data.data);
                } else {
                    modalBody.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Error: ${data.error || 'Failed to load loan details'}
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching loan details:', error);
                modalBody.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-info-circle me-2"></i>
                        Loan details will be loaded from the database when connected.
                    </div>
                    <dl class="row">
                        <dt class="col-sm-3">Loan ID:</dt>
                        <dd class="col-sm-9">${loanId}</dd>
                        
                        <dt class="col-sm-3">Note:</dt>
                        <dd class="col-sm-9 text-muted">
                            Connect to database to view complete loan details including payment schedule, 
                            transaction history, and borrower information.
                        </dd>
                    </dl>
                `;
            });
    };

    /**
     * Display loan details in modal
     */
    function displayLoanDetails(loan) {
        const modalBody = document.getElementById('loanDetailsBody');
        
        let html = `
            <div class="loan-detail-section">
                <h6>Loan Information</h6>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Loan Number:</span>
                    <span class="loan-detail-value"><strong>${loan.loan_number}</strong></span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Borrower Name:</span>
                    <span class="loan-detail-value">${loan.borrower_name}</span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Loan Type:</span>
                    <span class="loan-detail-value">${loan.loan_type_name || 'N/A'}</span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Account:</span>
                    <span class="loan-detail-value">${loan.account_code || 'N/A'} - ${loan.account_name || 'N/A'}</span>
                </div>
            </div>
            
            <div class="loan-detail-section">
                <h6>Loan Terms</h6>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Loan Amount:</span>
                    <span class="loan-detail-value"><strong>₱${parseFloat(loan.loan_amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong></span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Interest Rate:</span>
                    <span class="loan-detail-value">${parseFloat(loan.interest_rate).toFixed(2)}% per annum</span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Loan Term:</span>
                    <span class="loan-detail-value">${loan.loan_term} months</span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Start Date:</span>
                    <span class="loan-detail-value">${formatDate(loan.start_date)}</span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Maturity Date:</span>
                    <span class="loan-detail-value">${formatDate(loan.maturity_date)}</span>
                </div>
            </div>
            
            <div class="loan-detail-section">
                <h6>Current Status</h6>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Outstanding Balance:</span>
                    <span class="loan-detail-value"><strong class="text-danger">₱${parseFloat(loan.outstanding_balance).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong></span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Amount Paid:</span>
                    <span class="loan-detail-value"><strong class="text-success">₱${(parseFloat(loan.loan_amount) - parseFloat(loan.outstanding_balance)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong></span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Status:</span>
                    <span class="loan-detail-value"><span class="badge status-${loan.status.toLowerCase()}">${loan.status.toUpperCase()}</span></span>
                </div>
                <div class="loan-detail-row">
                    <span class="loan-detail-label">Transaction Type:</span>
                    <span class="loan-detail-value"><span class="badge badge-type-${(loan.transaction_type || 'other').toLowerCase()}">${loan.transaction_type || 'N/A'}</span></span>
                </div>
            </div>
        `;
        
        // Add payment schedule if available
        if (loan.payment_schedule && loan.payment_schedule.length > 0) {
            html += `
                <div class="loan-detail-section">
                    <h6>Payment Schedule</h6>
                    <div class="table-responsive">
                        <table class="table table-sm table-striped payment-schedule-table">
                            <thead>
                                <tr>
                                    <th>Due Date</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Total Payment</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            loan.payment_schedule.forEach(payment => {
                html += `
                    <tr>
                        <td>${formatDate(payment.due_date)}</td>
                        <td class="text-end">₱${parseFloat(payment.principal).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
                        <td class="text-end">₱${parseFloat(payment.interest).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
                        <td class="text-end"><strong>₱${parseFloat(payment.total_payment).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong></td>
                        <td class="text-end">₱${parseFloat(payment.balance).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
                        <td><span class="badge bg-${payment.status === 'paid' ? 'success' : 'warning'}">${payment.status}</span></td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        modalBody.innerHTML = html;
    }

    /**
     * Format date to readable format
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * View audit trail for current/all loans
     */
    window.viewAuditTrail = function(loanId) {
        const modal = new bootstrap.Modal(document.getElementById('auditTrailModal'));
        const modalBody = document.getElementById('auditTrailBody');
        
        // Show loading state
        modalBody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading audit trail...</p></td></tr>';
        
        modal.show();
        
        // Build URL with optional loan ID filter
        let url = 'api/loan-data.php?action=get_audit_trail';
        if (loanId) {
            url += '&id=' + loanId;
        }
        
        // Fetch audit trail from API
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    displayAuditTrail(data.data);
                } else if (data.success && data.data.length === 0) {
                    modalBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">
                                <i class="fas fa-info-circle fa-2x mb-3 d-block"></i>
                                <p>No audit trail records found.</p>
                            </td>
                        </tr>
                    `;
                } else {
                    modalBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center text-danger py-4">
                                <i class="fas fa-exclamation-circle fa-2x mb-3 d-block"></i>
                                <p>Error: ${data.error || 'Failed to load audit trail'}</p>
                            </td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching audit trail:', error);
                modalBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-database fa-2x mb-3 d-block"></i>
                            <p>Audit trail data will be available when connected to database.</p>
                            <small>The system will track all changes made to loans including creates, updates, payments, and deletions.</small>
                        </td>
                    </tr>
                `;
            });
    };

    /**
     * Display audit trail in modal
     */
    function displayAuditTrail(logs) {
        const modalBody = document.getElementById('auditTrailBody');
        let html = '';
        
        logs.forEach(log => {
            html += `
                <tr>
                    <td>${formatDateTime(log.created_at)}</td>
                    <td>${log.full_name || log.username || 'System'}</td>
                    <td><span class="badge bg-${getActionBadgeColor(log.action)}">${log.action}</span></td>
                    <td>${log.loan_number || log.object_id}</td>
                    <td>${log.additional_info || '-'}</td>
                    <td><small>${log.ip_address || '-'}</small></td>
                </tr>
            `;
        });
        
        modalBody.innerHTML = html;
    }

    /**
     * Format datetime to readable format
     */
    function formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get badge color for action type
     */
    function getActionBadgeColor(action) {
        const actionColors = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'danger',
            'RESTORE': 'warning',
            'PAYMENT': 'primary',
            'DISBURSEMENT': 'info'
        };
        return actionColors[action] || 'secondary';
    }

    /**
     * Export audit trail
     */
    window.exportAuditTrail = function() {
        showNotification('Audit trail export feature will be available when connected to database', 'info');
    };

    /**
     * Delete loan (soft delete - move to bin)
     */
    window.deleteLoan = function(loanId) {
        console.log('Delete loan called with ID:', loanId);
        
        if (!loanId || loanId === 'undefined' || loanId === 'null') {
            showNotification('Error: Invalid loan ID', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this loan? It will be moved to the bin station where you can restore it later.')) {
            return;
        }

        // Show loading
        showLoading('Moving loan to bin...');

        // Make AJAX call to delete loan
        const url = 'api/loan-data.php';
        const data = `action=soft_delete_loan&loan_id=${loanId}`;
        
        console.log('Making delete request to:', url);
        console.log('With data:', data);
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        })
        .then(response => {
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = JSON.parse(text);
                        if (errorData.error) {
                            errorMessage += ` - ${errorData.error}`;
                        }
                    } catch (e) {
                        if (text.length > 0) {
                            errorMessage += ` - ${text.substring(0, 200)}`;
                        }
                    }
                    throw new Error(errorMessage);
                });
            }
            
            return response.text().then(text => {
                console.log('Response text:', text);
                try {
                    return JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .then(data => {
            console.log('Response data:', data);
            hideLoading();
            if (data.success) {
                showNotification(data.message || 'Loan deleted successfully!', 'success');
                
                // Reload the page to refresh the table
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showNotification('Delete failed: ' + (data.error || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            hideLoading();
            showNotification('Delete failed: ' + error.message, 'error');
        });
    };

    /**
     * Get current filter parameters
     */
    function getCurrentFilters() {
        const params = new URLSearchParams();
        
        const dateFrom = document.querySelector('input[name="date_from"]');
        const dateTo = document.querySelector('input[name="date_to"]');
        const transactionType = document.querySelector('select[name="transaction_type"]');
        const status = document.querySelector('select[name="status"]');
        const accountNumber = document.querySelector('input[name="account_number"]');
        
        if (dateFrom && dateFrom.value) params.append('date_from', dateFrom.value);
        if (dateTo && dateTo.value) params.append('date_to', dateTo.value);
        if (transactionType && transactionType.value) params.append('transaction_type', transactionType.value);
        if (status && status.value) params.append('status', status.value);
        if (accountNumber && accountNumber.value) params.append('account_number', accountNumber.value);
        
        return params.toString();
    }

    /**
     * Show loading overlay
     */
    function showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'spinner-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white mt-3">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Show notification toast
     */
    function showNotification(message, type = 'success') {
        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' :
                          type === 'info' ? 'alert-info' : 'alert-success';
        
        const iconClass = type === 'error' ? 'fa-exclamation-circle' :
                         type === 'warning' ? 'fa-exclamation-triangle' :
                         type === 'info' ? 'fa-info-circle' : 'fa-check-circle';
        
        const toast = document.createElement('div');
        toast.className = `alert ${alertClass} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            <i class="fas ${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.remove();
        }, 5000);
    }

})();