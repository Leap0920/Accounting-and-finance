/**
 * Financial Reporting & Compliance Module
 * Modern UI Implementation
 */

// Global variables
let currentReportData = null;
let currentReportType = null;
let reportModal = null;

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal
    const modalElement = document.getElementById('reportModal');
    if (modalElement) {
        reportModal = new bootstrap.Modal(modalElement);
    }
    
    // Set default dates
    setDefaultDates();
    
    // Load initial audit trail data
    loadAuditTrail();
    
    // Load compliance reports
    loadComplianceReports();
});

/**
 * Set default dates for filters
 */
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    
    // Set audit trail dates
    const auditDateFrom = document.getElementById('audit-date-from');
    const auditDateTo = document.getElementById('audit-date-to');
    if (auditDateFrom) auditDateFrom.value = firstDayOfYear;
    if (auditDateTo) auditDateTo.value = today;
}

/**
 * Open report generation modal
 */
function openReportModal(reportType) {
    currentReportType = reportType;
    
    const modal = document.getElementById('reportModal');
    const title = document.getElementById('reportModalTitle');
    const content = document.getElementById('reportModalContent');
    
    // Set modal title
    const titles = {
        'balance-sheet': 'Balance Sheet',
        'income-statement': 'Income Statement',
        'cash-flow': 'Cash Flow Statement',
        'trial-balance': 'Trial Balance'
    };
    
    title.textContent = 'Generate ' + titles[reportType];
    
    // Show filter options
    content.innerHTML = getReportFilterHTML(reportType);
    
    // Show modal
    if (reportModal) {
        reportModal.show();
    }
}

/**
 * Get report filter HTML based on type
 */
function getReportFilterHTML(reportType) {
    let html = '<div class="row g-3 mb-4">';
    
    if (reportType === 'balance-sheet') {
        html += `
            <div class="col-md-6">
                <label class="form-label">As of Date</label>
                <input type="date" class="form-control" id="report-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Detail Level</label>
                <select class="form-select" id="report-detail">
                    <option value="yes">Detailed</option>
                    <option value="no">Summary</option>
                </select>
            </div>
        `;
    } else {
        const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        
        html += `
            <div class="col-md-6">
                <label class="form-label">Date From</label>
                <input type="date" class="form-control" id="report-date-from" value="${firstDayOfYear}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Date To</label>
                <input type="date" class="form-control" id="report-date-to" value="${today}">
            </div>
        `;
        
        if (reportType === 'trial-balance') {
            html += `
                <div class="col-md-12">
                    <label class="form-label">Account Type</label>
                    <select class="form-select" id="report-account-type">
                        <option value="">All Types</option>
                        <option value="asset">Assets</option>
                        <option value="liability">Liabilities</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expenses</option>
                    </select>
                </div>
            `;
        }
    }
    
    html += '</div>';
    
    html += `
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" onclick="generateReport('${reportType}')">
                <i class="fas fa-sync-alt me-2"></i>Generate Report
            </button>
        </div>
        <div id="report-content" class="mt-4"></div>
    `;
    
    return html;
}

/**
 * Generate report
 */
function generateReport(reportType) {
    const contentDiv = document.getElementById('report-content');
    
    // Show loading state
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Generating report, please wait...</p>
        </div>
    `;
    
    // Gather parameters
    const params = getReportParams(reportType);
    
    // Make AJAX request
    $.ajax({
        url: 'api/financial-reports.php',
        method: 'GET',
        data: params,
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                currentReportData = response;
                displayReportInModal(reportType, response);
                
                // Log to audit trail
                logAuditAction('Generate Report', reportType);
            } else {
                showError(response.message || 'Failed to generate report');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            showError('Connection error. Please try again.');
        }
    });
}

/**
 * Get report parameters
 */
function getReportParams(reportType) {
    let params = { report_type: reportType };
    
    if (reportType === 'balance-sheet') {
        params.as_of_date = $('#report-date').val();
        params.show_subaccounts = $('#report-detail').val();
    } else {
        params.date_from = $('#report-date-from').val();
        params.date_to = $('#report-date-to').val();
        
        if (reportType === 'trial-balance') {
            params.account_type = $('#report-account-type').val();
        }
    }
    
    return params;
}

/**
 * Display report in modal
 */
function displayReportInModal(reportType, data) {
    const contentDiv = document.getElementById('report-content');
    
    let html = `
        <div class="report-display">
            <div class="report-header">
                <div class="company-name">EVERGREEN ACCOUNTING & FINANCE</div>
                <h3>${data.report_title}</h3>
                <div class="report-period">${data.period || data.as_of_date}</div>
            </div>
    `;
    
    // Generate report content based on type
    if (reportType === 'trial-balance') {
        html += generateTrialBalanceHTML(data);
    } else if (reportType === 'balance-sheet') {
        html += generateBalanceSheetHTML(data);
    } else if (reportType === 'income-statement') {
        html += generateIncomeStatementHTML(data);
    } else if (reportType === 'cash-flow') {
        html += generateCashFlowHTML(data);
    }
    
    html += `
            <div class="d-flex justify-content-end gap-2 mt-4">
                <button class="btn btn-success" onclick="exportReport('excel')">
                    <i class="fas fa-file-excel me-2"></i>Export Excel
                </button>
                <button class="btn btn-danger" onclick="exportReport('pdf')">
                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                </button>
                <button class="btn btn-secondary" onclick="window.print()">
                    <i class="fas fa-print me-2"></i>Print
                </button>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

/**
 * Generate Trial Balance HTML
 */
function generateTrialBalanceHTML(data) {
    let html = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th style="text-align: right;">Debit</th>
                    <th style="text-align: right;">Credit</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (data.accounts && data.accounts.length > 0) {
        data.accounts.forEach(account => {
            html += `
                <tr>
                    <td><strong>${account.code}</strong></td>
                    <td>${account.name}</td>
                    <td><span class="badge bg-secondary">${account.account_type.toUpperCase()}</span></td>
                    <td class="amount">${formatCurrency(account.total_debit)}</td>
                    <td class="amount">${formatCurrency(account.total_credit)}</td>
                </tr>
            `;
        });
    }
    
    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>TOTAL</strong></td>
                    <td class="amount"><strong>${formatCurrency(data.total_debit)}</strong></td>
                    <td class="amount"><strong>${formatCurrency(data.total_credit)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
    
    if (data.is_balanced) {
        html += '<div class="alert alert-success mt-3"><i class="fas fa-check-circle me-2"></i>Trial Balance is balanced!</div>';
    }
    
    return html;
}

/**
 * Generate Balance Sheet HTML
 */
function generateBalanceSheetHTML(data) {
    let html = '<h5 class="mt-4 mb-3 text-teal">ASSETS</h5>';
    html += generateAccountTable(data.assets, data.total_assets, 'TOTAL ASSETS');
    
    html += '<h5 class="mt-4 mb-3 text-teal">LIABILITIES</h5>';
    html += generateAccountTable(data.liabilities, data.total_liabilities, 'TOTAL LIABILITIES');
    
    html += '<h5 class="mt-4 mb-3 text-teal">EQUITY</h5>';
    html += generateAccountTable(data.equity, data.total_equity, 'TOTAL EQUITY');
    
    html += `
        <div class="alert alert-info mt-3">
            <strong>Total Liabilities & Equity:</strong> ${formatCurrency(data.total_liabilities_equity)}
        </div>
    `;
    
    if (data.is_balanced) {
        html += '<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i>Balance Sheet is balanced!</div>';
    }
    
    return html;
}

/**
 * Generate Income Statement HTML
 */
function generateIncomeStatementHTML(data) {
    let html = '<h5 class="mt-4 mb-3 text-teal">REVENUE</h5>';
    html += generateAccountTable(data.revenue, data.total_revenue, 'TOTAL REVENUE');
    
    html += '<h5 class="mt-4 mb-3 text-teal">EXPENSES</h5>';
    html += generateAccountTable(data.expenses, data.total_expenses, 'TOTAL EXPENSES');
    
    html += `
        <div class="alert ${data.net_income >= 0 ? 'alert-success' : 'alert-warning'} mt-3">
            <h5><strong>NET INCOME:</strong> ${formatCurrency(data.net_income)}</h5>
            <p class="mb-0">Profit Margin: ${data.net_income_percentage.toFixed(2)}%</p>
        </div>
    `;
    
    return html;
}

/**
 * Generate Cash Flow HTML
 */
function generateCashFlowHTML(data) {
    let html = `
        <table class="report-table">
            <tbody>
                <tr>
                    <td><strong>Cash from Operating Activities</strong></td>
                    <td class="amount">${formatCurrency(data.cash_from_operations)}</td>
                </tr>
                <tr>
                    <td><strong>Cash from Investing Activities</strong></td>
                    <td class="amount">${formatCurrency(data.cash_from_investing)}</td>
                </tr>
                <tr>
                    <td><strong>Cash from Financing Activities</strong></td>
                    <td class="amount">${formatCurrency(data.cash_from_financing)}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>NET CASH CHANGE</strong></td>
                    <td class="amount"><strong>${formatCurrency(data.net_cash_change)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
    
    return html;
}

/**
 * Generate account table helper
 */
function generateAccountTable(accounts, total, totalLabel) {
    let html = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (accounts && accounts.length > 0) {
        accounts.forEach(account => {
            html += `
                <tr>
                    <td><strong>${account.code}</strong></td>
                    <td>${account.name}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3" class="text-center text-muted">No accounts found</td></tr>';
    }
    
    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2"><strong>${totalLabel}</strong></td>
                    <td class="amount"><strong>${formatCurrency(total)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
    
    return html;
}

/**
 * Show error message
 */
function showError(message) {
    const contentDiv = document.getElementById('report-content');
    contentDiv.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
        </div>
    `;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) {
        return '₱0.00';
    }
    
    const formatted = Math.abs(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return amount < 0 ? `(₱${formatted})` : `₱${formatted}`;
}

/**
 * Export report
 */
function exportReport(format) {
    if (!currentReportData) {
        alert('Please generate a report first.');
        return;
    }
    
    alert(`Exporting ${currentReportType} report as ${format.toUpperCase()}...\nThis feature will download the report in the selected format.`);
    
    // Log to audit trail
    logAuditAction('Export Report', currentReportType, format);
}

/**
 * Open tax report modal
 */
function openTaxReportModal(taxType) {
    alert('Tax Report: ' + taxType + '\n\nThis feature generates specific tax reports for compliance.\n\nComing soon!');
    
    // Log to audit trail
    logAuditAction('Generate Tax Report', taxType);
}

/**
 * Generate compliance report
 */
function generateComplianceReport() {
    // Show compliance report modal
    const modal = document.getElementById('reportModal');
    const title = document.getElementById('reportModalTitle');
    const content = document.getElementById('reportModalContent');
    
    title.textContent = 'Generate Compliance Report';
    
    content.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <label class="form-label">Compliance Type</label>
                <select class="form-select" id="compliance-type">
                    <option value="gaap">GAAP Compliance</option>
                    <option value="sox">SOX Compliance</option>
                    <option value="bir">BIR Compliance</option>
                    <option value="ifrs">IFRS Compliance</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Period</label>
                <select class="form-select" id="compliance-period">
                    <option value="current_month">Current Month</option>
                    <option value="current_quarter">Current Quarter</option>
                    <option value="current_year">Current Year</option>
                    <option value="custom">Custom Period</option>
                </select>
            </div>
            <div class="col-md-6" id="custom-period-start" style="display: none;">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" id="period-start">
            </div>
            <div class="col-md-6" id="custom-period-end" style="display: none;">
                <label class="form-label">End Date</label>
                <input type="date" class="form-control" id="period-end">
            </div>
        </div>
        
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" onclick="executeComplianceReport()">
                <i class="fas fa-sync-alt me-2"></i>Generate Report
            </button>
        </div>
        
        <div id="compliance-report-content" class="mt-4"></div>
    `;
    
    // Show/hide custom period fields
    document.getElementById('compliance-period').addEventListener('change', function() {
        const customFields = document.getElementById('custom-period-start');
        const customFieldsEnd = document.getElementById('custom-period-end');
        if (this.value === 'custom') {
            customFields.style.display = 'block';
            customFieldsEnd.style.display = 'block';
        } else {
            customFields.style.display = 'none';
            customFieldsEnd.style.display = 'none';
        }
    });
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('period-start').value = firstDayOfMonth;
    document.getElementById('period-end').value = today;
    
    if (reportModal) {
        reportModal.show();
    }
}

/**
 * Execute compliance report generation
 */
function executeComplianceReport() {
    const contentDiv = document.getElementById('compliance-report-content');
    
    // Show loading state
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Generating compliance report, please wait...</p>
        </div>
    `;
    
    // Get form data
    const reportType = document.getElementById('compliance-type').value;
    const period = document.getElementById('compliance-period').value;
    
    let periodStart, periodEnd;
    
    if (period === 'custom') {
        periodStart = document.getElementById('period-start').value;
        periodEnd = document.getElementById('period-end').value;
    } else {
        const dates = getPeriodDates(period);
        periodStart = dates.start;
        periodEnd = dates.end;
    }
    
    // Make AJAX request
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'POST',
        data: {
            action: 'generate_compliance_report',
            report_type: reportType,
            period_start: periodStart,
            period_end: periodEnd
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayComplianceReport(response.data);
                loadComplianceReports(); // Refresh the table
            } else {
                showComplianceError(response.error || 'Failed to generate compliance report');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            showComplianceError('Connection error. Please try again.');
        }
    });
}

/**
 * Get period dates based on selection
 */
function getPeriodDates(period) {
    const today = new Date();
    let start, end;
    
    switch (period) {
        case 'current_month':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'current_quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            start = new Date(today.getFullYear(), quarter * 3, 1);
            end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
            break;
        case 'current_year':
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
            break;
        default:
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

/**
 * Display compliance report results
 */
function displayComplianceReport(data) {
    const contentDiv = document.getElementById('compliance-report-content');
    
    const scoreColor = data.compliance_score >= 80 ? 'success' : 
                      data.compliance_score >= 60 ? 'warning' : 'danger';
    
    let html = `
        <div class="compliance-report-results">
            <div class="alert alert-${scoreColor}">
                <h5><i class="fas fa-chart-pie me-2"></i>Compliance Score: ${data.compliance_score}%</h5>
                <p class="mb-0">Report Type: ${data.report_type.toUpperCase()}</p>
                <p class="mb-0">Period: ${data.period_start} to ${data.period_end}</p>
                <p class="mb-0">Generated: ${data.generated_date}</p>
            </div>
    `;
    
    if (data.issues_found && data.issues_found.length > 0) {
        html += `
            <div class="alert alert-warning">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Issues Found:</h6>
                <ul class="mb-0">
        `;
        data.issues_found.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        html += `
                </ul>
            </div>
        `;
    } else {
        html += `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>No compliance issues found!
            </div>
        `;
    }
    
    html += `
            <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-success" onclick="exportComplianceReport('${data.report_id}', 'excel')">
                    <i class="fas fa-file-excel me-2"></i>Export Excel
                </button>
                <button class="btn btn-danger" onclick="exportComplianceReport('${data.report_id}', 'pdf')">
                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                </button>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

/**
 * Show compliance error
 */
function showComplianceError(message) {
    const contentDiv = document.getElementById('compliance-report-content');
    contentDiv.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
        </div>
    `;
}

/**
 * Export compliance report - REMOVED (not working)
 */
function exportComplianceReport(reportId, format) {
    showNotification('Export functionality has been removed due to technical issues.', 'info');
}

/**
 * Delete compliance report (soft delete - move to bin)
 */
function deleteComplianceReport(reportId) {
    if (!confirm('Are you sure you want to move this compliance report to the bin? You can restore it later from Settings > Bin Station.')) {
        return;
    }
    
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'POST',
        data: { 
            action: 'delete_compliance_report',
            report_id: reportId
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                showNotification('Compliance report moved to bin successfully!', 'success');
                loadComplianceReports(); // Refresh the table
            } else {
                showNotification('Delete failed: ' + response.error, 'error');
            }
        },
        error: function(xhr, status, error) {
            showNotification('Delete failed: ' + error, 'error');
        }
    });
    
    // Log to audit trail
    logAuditActionToDB('Soft Delete Compliance Report', 'compliance_report', reportId);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Load compliance reports
 */
function loadComplianceReports() {
    console.log('Loading compliance reports...');
    
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'GET',
        data: { action: 'get_compliance_reports' },
        dataType: 'json',
        success: function(response) {
            console.log('Compliance reports response:', response);
            if (response.success) {
                updateComplianceReportsTable(response.data);
            } else {
                console.error('API Error:', response.error);
                showComplianceReportsError(response.error || 'Failed to load compliance reports');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error loading compliance reports:', error);
            console.error('Response:', xhr.responseText);
            showComplianceReportsError('Connection error. Please check console for details.');
        }
    });
}

/**
 * Show compliance reports error
 */
function showComplianceReportsError(message) {
    const tableBody = document.getElementById('complianceReportsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-danger py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>
                <strong>Error Loading Compliance Reports</strong><br>
                <small>${message}</small><br>
                <button class="btn btn-sm btn-primary mt-2" onclick="loadComplianceReports()">
                    <i class="fas fa-refresh me-1"></i>Retry
                </button>
            </td>
        </tr>
    `;
}

/**
 * Update compliance reports table
 */
function updateComplianceReportsTable(reports) {
    const tableBody = document.getElementById('complianceReportsTable');
    if (!tableBody) return;
    
    if (!reports || reports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="fas fa-folder-open fa-3x mb-3 d-block"></i>
                    No compliance reports generated yet. Click "Generate Compliance Reports" to create one.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    reports.forEach(report => {
        const statusBadge = getStatusBadge(report.status);
        const reportTypeLabel = getReportTypeLabel(report.report_type);
        const period = `${formatDate(report.period_start)} to ${formatDate(report.period_end)}`;
        const scoreDisplay = report.compliance_score ? `${report.compliance_score}%` : 'N/A';
        
        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas ${getReportTypeIcon(report.report_type)} me-2 text-primary"></i>
                        <div>
                            <strong>${reportTypeLabel}</strong>
                            <br><small class="text-muted">Score: ${scoreDisplay}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <small class="text-muted">${period}</small>
                </td>
                <td>
                    <small class="text-muted">${formatDateTime(report.generated_date)}</small>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteComplianceReport(${report.id})" title="Move to Bin">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Helper functions for compliance reports
 */
function getStatusBadge(status) {
    switch(status) {
        case 'completed':
            return '<span class="badge badge-compliant">Completed</span>';
        case 'generating':
            return '<span class="badge badge-review">Generating</span>';
        case 'failed':
            return '<span class="badge badge-due-soon">Failed</span>';
        default:
            return '<span class="badge badge-secondary">Unknown</span>';
    }
}

function getReportTypeLabel(type) {
    const labels = {
        'gaap': 'GAAP Compliance',
        'sox': 'SOX Compliance', 
        'bir': 'BIR Compliance',
        'ifrs': 'IFRS Compliance'
    };
    return labels[type] || type.toUpperCase();
}

function getReportTypeIcon(type) {
    const icons = {
        'gaap': 'fa-balance-scale',
        'sox': 'fa-shield-alt',
        'bir': 'fa-file-invoice',
        'ifrs': 'fa-globe'
    };
    return icons[type] || 'fa-file-alt';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

/**
 * View compliance report - REMOVED (not working)
 */
function viewComplianceReport(reportId) {
    showNotification('View functionality has been removed due to technical issues.', 'info');
}

/**
 * Display compliance report details in modal
 */
function displayComplianceReportDetails(report) {
    const content = document.getElementById('reportModalContent');
    
    const issuesList = report.issues_found && report.issues_found.length > 0 
        ? report.issues_found.map(issue => `<li>${issue}</li>`).join('')
        : '<li class="text-success">No issues found</li>';
    
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h6>Report Information</h6>
                <table class="table table-sm">
                    <tr><td><strong>Type:</strong></td><td>${getReportTypeLabel(report.report_type)}</td></tr>
                    <tr><td><strong>Period:</strong></td><td>${formatDate(report.period_start)} to ${formatDate(report.period_end)}</td></tr>
                    <tr><td><strong>Generated:</strong></td><td>${formatDateTime(report.generated_date)}</td></tr>
                    <tr><td><strong>Status:</strong></td><td>${getStatusBadge(report.status)}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Compliance Score</h6>
                <div class="text-center">
                    <div class="compliance-score-circle ${getScoreClass(report.compliance_score)}">
                        <span class="score-value">${report.compliance_score || 0}%</span>
                    </div>
                    <p class="mt-2 text-muted">Overall Compliance</p>
                </div>
            </div>
        </div>
        
        <div class="mb-4">
            <h6>Issues Found</h6>
            <ul class="list-unstyled">
                ${issuesList}
            </ul>
        </div>
        
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-primary" onclick="exportComplianceReport(${report.id}, 'pdf')">
                <i class="fas fa-download me-2"></i>Export PDF
            </button>
        </div>
    `;
}

function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
}

/**
 * Filter audit trail
 */
function filterAuditTrail() {
    loadAuditTrail();
}

/**
 * Load audit trail
 */
function loadAuditTrail() {
    const tableBody = document.getElementById('auditTrailTable');
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-5">
                <div class="loading-spinner"></div>
                <p class="mt-3">Loading audit trail...</p>
            </td>
        </tr>
    `;
    
    // Get filter values
    const dateFrom = document.getElementById('audit-date-from').value;
    const dateTo = document.getElementById('audit-date-to').value;
    const userFilter = document.getElementById('audit-user-filter').value;
    const actionFilter = document.getElementById('audit-action-filter').value;
    
    // Make AJAX request
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'GET',
        data: {
            action: 'get_audit_trail',
            date_from: dateFrom,
            date_to: dateTo,
            user_filter: userFilter,
            action_filter: actionFilter
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateAuditTrailTable(response.data);
            } else {
                showAuditTrailError(response.error || 'Failed to load audit trail');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            showAuditTrailError('Connection error. Please try again.');
        }
    });
}

/**
 * Update audit trail table
 */
function updateAuditTrailTable(logs) {
    const tableBody = document.getElementById('auditTrailTable');
    if (!tableBody) return;
    
    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="fas fa-history fa-3x mb-3 d-block"></i>
                    No audit records found. Apply filters to view audit trail.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        const additionalInfo = log.additional_info ? JSON.parse(log.additional_info) : {};
        const actionIcon = getActionIcon(log.action);
        const actionClass = getActionClass(log.action);
        const details = formatAuditDetails(log.action, additionalInfo);
        
        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas ${actionIcon} me-2 text-${actionClass}"></i>
                        <small class="text-muted">${formatDateTime(log.created_at)}</small>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="fas fa-user-circle text-primary"></i>
                        </div>
                        <div>
                            <strong>${log.full_name || log.username || 'Unknown'}</strong>
                            <br><small class="text-muted">${log.ip_address || 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${actionClass}">${log.action}</span>
                </td>
                <td>
                    <small class="text-muted">${log.object_type || 'N/A'}</small>
                </td>
                <td>
                    <code class="text-primary">${log.object_id || 'N/A'}</code>
                </td>
                <td>
                    <div class="audit-details">
                        ${details}
                    </div>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-info" onclick="viewAuditDetails(${log.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="exportAuditLog(${log.id})" title="Export">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Get action icon based on action type
 */
function getActionIcon(action) {
    const icons = {
        'Login': 'fa-sign-in-alt',
        'Logout': 'fa-sign-out-alt',
        'Create': 'fa-plus',
        'Update': 'fa-edit',
        'Delete': 'fa-trash',
        'View': 'fa-eye',
        'Export': 'fa-download',
        'Generate': 'fa-file-alt',
        'Post': 'fa-check',
        'Approve': 'fa-check-circle',
        'Reject': 'fa-times-circle'
    };
    
    // Find matching icon by partial match
    for (const [key, icon] of Object.entries(icons)) {
        if (action.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    
    return 'fa-circle';
}

/**
 * Get action class based on action type
 */
function getActionClass(action) {
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('generate')) {
        return 'success';
    } else if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
        return 'warning';
    } else if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('reject')) {
        return 'danger';
    } else if (action.toLowerCase().includes('view') || action.toLowerCase().includes('export')) {
        return 'info';
    } else if (action.toLowerCase().includes('login') || action.toLowerCase().includes('logout')) {
        return 'primary';
    }
    
    return 'secondary';
}

/**
 * Format audit details based on action and additional info
 */
function formatAuditDetails(action, additionalInfo) {
    let details = action;
    
    if (additionalInfo.report_type) {
        details += ` (${additionalInfo.report_type.toUpperCase()})`;
    }
    
    if (additionalInfo.format) {
        details += ` - ${additionalInfo.format.toUpperCase()}`;
    }
    
    if (additionalInfo.amount) {
        details += ` - ₱${parseFloat(additionalInfo.amount).toLocaleString()}`;
    }
    
    if (additionalInfo.status) {
        details += ` - Status: ${additionalInfo.status}`;
    }
    
    return `<small class="text-muted">${details}</small>`;
}

/**
 * View audit log details
 */
function viewAuditDetails(logId) {
    // Show loading modal
    const modal = document.getElementById('reportModal');
    const title = document.getElementById('reportModalTitle');
    const content = document.getElementById('reportModalContent');
    
    title.textContent = 'Audit Log Details';
    content.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner"></div>
            <p class="mt-3">Loading audit details...</p>
        </div>
    `;
    
    if (modal) {
        modal.show();
    }
    
    // Fetch audit log details
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'GET',
        data: { action: 'get_audit_log', log_id: logId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayAuditLogDetails(response.data);
            } else {
                content.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error loading audit details: ${response.error}
                    </div>
                `;
            }
        },
        error: function(xhr, status, error) {
            content.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Connection error: ${error}
                </div>
            `;
        }
    });
}

/**
 * Display audit log details in modal
 */
function displayAuditLogDetails(log) {
    const content = document.getElementById('reportModalContent');
    const additionalInfo = log.additional_info ? JSON.parse(log.additional_info) : {};
    
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <h6>Audit Information</h6>
                <table class="table table-sm">
                    <tr><td><strong>Action:</strong></td><td>${log.action}</td></tr>
                    <tr><td><strong>User:</strong></td><td>${log.full_name || log.username}</td></tr>
                    <tr><td><strong>Timestamp:</strong></td><td>${formatDateTime(log.created_at)}</td></tr>
                    <tr><td><strong>IP Address:</strong></td><td>${log.ip_address || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Object Details</h6>
                <table class="table table-sm">
                    <tr><td><strong>Type:</strong></td><td>${log.object_type || 'N/A'}</td></tr>
                    <tr><td><strong>ID:</strong></td><td>${log.object_id || 'N/A'}</td></tr>
                </table>
            </div>
        </div>
        
        ${Object.keys(additionalInfo).length > 0 ? `
        <div class="mb-4">
            <h6>Additional Information</h6>
            <div class="bg-light p-3 rounded">
                <pre class="mb-0"><code>${JSON.stringify(additionalInfo, null, 2)}</code></pre>
            </div>
        </div>
        ` : ''}
        
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-primary" onclick="exportAuditLog(${log.id})">
                <i class="fas fa-download me-2"></i>Export Log
            </button>
        </div>
    `;
}

/**
 * Export audit log
 */
function exportAuditLog(logId) {
    showNotification('Exporting audit log...', 'info');
    
    // Create download link for audit log
    const link = document.createElement('a');
    link.href = `api/compliance-reports.php?action=export_audit_log&log_id=${logId}`;
    link.download = `audit_log_${logId}.txt`;
    link.click();
    
    showNotification('Audit log exported successfully!', 'success');
}

/**
 * Show audit trail error
 */
function showAuditTrailError(message) {
    const tableBody = document.getElementById('auditTrailTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-danger py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>
                ${message}
            </td>
        </tr>
    `;
}

/**
 * Log audit action to database
 */
function logAuditActionToDB(action, objectType, objectId, additionalInfo = {}) {
    $.ajax({
        url: 'api/compliance-reports.php',
        method: 'POST',
        data: {
            action: 'log_audit_action',
            audit_action: action,
            object_type: objectType,
            object_id: objectId,
            additional_info: additionalInfo
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Reload audit trail to show new entry
                loadAuditTrail();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error logging audit action:', error);
        }
    });
}

/**
 * Save settings
 */
function saveSettings() {
    const period = document.getElementById('default-period').value;
    const format = document.getElementById('default-format').value;
    const companyName = document.getElementById('company-name').value;
    const fiscalYearEnd = document.getElementById('fiscal-year-end').value;
    const footerText = document.getElementById('footer-text').value;
    
    // In real implementation, this would save to database
    alert('Settings saved successfully!\n\nDefault Period: ' + period + '\nDefault Format: ' + format);
    
    // Log to audit trail
    logAuditAction('Update Settings', 'Report Configuration');
}
