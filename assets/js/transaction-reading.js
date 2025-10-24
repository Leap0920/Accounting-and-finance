/**
 * Transaction Reading Module JavaScript
 * Handles filtering, export, print, and audit trail functionality
 */

(function() {
    'use strict';

    let dataTable = null;
    let currentTransactionId = null;

    /**
     * Initialize when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Check if table has data (PHP rendered)
        const hasData = document.querySelector('#transactionTable tbody tr:not([colspan])') !== null;
        
        if (hasData) {
            // Initialize DataTables with existing data
            initDataTable();
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

        const table = $('#transactionTable');
        if (table.length && !$.fn.DataTable.isDataTable('#transactionTable')) {
            dataTable = table.DataTable({
                responsive: true,
                pageLength: 25,
                order: [[1, 'desc']], // Order by date descending
                language: {
                    info: "Showing _START_ to _END_ of _TOTAL_ transactions",
                    infoEmpty: "Showing 0 to 0 of 0 transactions",
                    infoFiltered: "(filtered from _MAX_ total transactions)",
                    lengthMenu: "Show _MENU_ transactions per page",
                    search: "Search transactions:",
                    zeroRecords: "No matching transactions found",
                    emptyTable: "No transaction data available"
                },
                columnDefs: [
                    { orderable: false, targets: [9] }, // Actions column not sortable
                    { type: 'date', targets: [1] }, // Date column
                    { className: 'text-end', targets: [5, 6] }, // Debit and Credit columns right-aligned
                    { className: 'text-center', targets: [7] } // Status column centered
                ],
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
            });
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
            // In production, this would make an AJAX call to generate Excel file
            // For now, we'll show a notification
            hideLoading();
            showNotification('Excel export feature will be available when connected to database', 'info');
            
            // Sample implementation:
            // fetch('export-transactions.php?format=excel&' + getCurrentFilters())
            //     .then(response => response.blob())
            //     .then(blob => {
            //         const url = window.URL.createObjectURL(blob);
            //         const a = document.createElement('a');
            //         a.href = url;
            //         a.download = 'transactions_' + new Date().toISOString().split('T')[0] + '.xlsx';
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
     * Print transaction table
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
     * View transaction details
     */
    window.viewTransactionDetails = function(transactionId) {
        currentTransactionId = transactionId;
        
        const modal = new bootstrap.Modal(document.getElementById('transactionDetailsModal'));
        const modalBody = document.getElementById('transactionDetailsBody');
        
        // Show loading state
        modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading transaction details...</p></div>';
        
        modal.show();
        
        // Simulate loading (in production, fetch from database)
        setTimeout(function() {
            modalBody.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Transaction details will be loaded from the database.
                </div>
                <dl class="row">
                    <dt class="col-sm-3">Transaction ID:</dt>
                    <dd class="col-sm-9">${transactionId}</dd>
                    
                    <dt class="col-sm-3">Status:</dt>
                    <dd class="col-sm-9"><span class="badge bg-success">Sample Data</span></dd>
                    
                    <dt class="col-sm-3">Note:</dt>
                    <dd class="col-sm-9 text-muted">
                        Connect to database to view actual transaction details including journal entries, 
                        account mappings, and complete audit trail.
                    </dd>
                </dl>
            `;
        }, 500);
    };

    /**
     * View audit trail for current/all transactions
     */
    window.viewAuditTrail = function(transactionId) {
        const modal = new bootstrap.Modal(document.getElementById('auditTrailModal'));
        const modalBody = document.getElementById('auditTrailBody');
        
        // Show loading state
        modalBody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading audit trail...</p></td></tr>';
        
        modal.show();
        
        // Simulate loading (in production, fetch from audit_logs table)
        setTimeout(function() {
            modalBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-database fa-2x mb-3 d-block"></i>
                        <p>Audit trail data will be available when connected to database.</p>
                        <small>The system will track all changes made to transactions including creates, updates, posts, and voids.</small>
                    </td>
                </tr>
            `;
        }, 500);
    };

    /**
     * Export audit trail
     */
    window.exportAuditTrail = function() {
        showNotification('Audit trail export feature will be available when connected to database', 'info');
    };

    /**
     * Get current filter parameters
     */
    function getCurrentFilters() {
        const params = new URLSearchParams();
        
        const dateFrom = document.getElementById('date_from');
        const dateTo = document.getElementById('date_to');
        const type = document.getElementById('type');
        const status = document.getElementById('status');
        const account = document.getElementById('account');
        
        if (dateFrom && dateFrom.value) params.append('date_from', dateFrom.value);
        if (dateTo && dateTo.value) params.append('date_to', dateTo.value);
        if (type && type.value) params.append('type', type.value);
        if (status && status.value) params.append('status', status.value);
        if (account && account.value) params.append('account', account.value);
        
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

    // Note: Transaction data is now loaded via PHP server-side rendering
    // No need for AJAX data loading

    /**
     * Sample function to populate transaction data (for demo)
     * In production, this would be replaced with actual database queries
     */
    window.loadSampleData = function() {
        showNotification('Sample data loading is disabled. Connect to database to load actual transactions.', 'info');
    };

})();

