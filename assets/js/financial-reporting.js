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
    
    // Load recent tax reports
    loadRecentTaxReports();
    
    // Load report settings
    loadReportSettings();
    
    // Add event listeners to toggle buttons for auto-save
    addToggleEventListeners();
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
    // Set default dates based on tax type
    let defaultStart, defaultEnd, title, description;
    
    switch(taxType) {
        case 'income-tax':
            title = 'Income Tax Report';
            description = 'Generate annual income tax return with revenue and expense breakdown';
            defaultStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // Jan 1
            defaultEnd = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]; // Dec 31
            break;
        case 'payroll-tax':
            title = 'Payroll Tax Report';
            description = 'Generate quarterly payroll tax returns with employee withholdings';
            defaultStart = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0]; // 3 months ago
            defaultEnd = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).toISOString().split('T')[0]; // Last month end
            break;
        case 'sales-tax':
            title = 'Sales Tax Report';
            description = 'Generate monthly sales tax returns with VAT collection details';
            defaultStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]; // Last month start
            defaultEnd = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).toISOString().split('T')[0]; // Last month end
            break;
        default:
            alert('Invalid tax report type');
            return;
    }
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="taxReportModal" tabindex="-1" aria-labelledby="taxReportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="taxReportModalLabel">
                            <i class="fas fa-file-invoice me-2"></i>${title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <p class="text-muted">${description}</p>
                        </div>
                        
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="taxPeriodStart" class="form-label">Period Start</label>
                                <input type="date" class="form-control" id="taxPeriodStart" value="${defaultStart}">
                            </div>
                            <div class="col-md-6">
                                <label for="taxPeriodEnd" class="form-control">Period End</label>
                                <input type="date" class="form-control" id="taxPeriodEnd" value="${defaultEnd}">
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <label for="taxReportFormat" class="form-label">Export Format</label>
                            <select class="form-select" id="taxReportFormat">
                                <option value="json">View in Browser</option>
                                <option value="pdf">PDF Document</option>
                                <option value="excel">Excel Spreadsheet</option>
                                <option value="csv">CSV File</option>
                            </select>
                        </div>
                        
                        <div id="taxReportPreview" class="mt-4" style="display: none;">
                            <h6>Report Preview</h6>
                            <div class="border rounded p-3 bg-light" id="taxReportContent">
                                <!-- Report content will be loaded here -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="generateTaxReport('${taxType}')">
                            <i class="fas fa-file-download me-2"></i>Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('taxReportModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taxReportModal'));
    modal.show();
    
    // Store tax type for later use
    window.currentTaxType = taxType;
    
    // Add event listener to reset button state when modal is closed
    const modalElement = document.getElementById('taxReportModal');
    modalElement.addEventListener('hidden.bs.modal', function() {
        // Reset any stuck button states
        const generateBtn = modalElement.querySelector('button[onclick*="generateTaxReport"]');
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-file-download me-2"></i>Generate Report';
            generateBtn.disabled = false;
        }
    });
    
    // Log to audit trail
    logAuditAction('Open Tax Report Modal', taxType);
}

/**
 * Generate tax report
 */
function generateTaxReport(taxType) {
    const periodStart = document.getElementById('taxPeriodStart').value;
    const periodEnd = document.getElementById('taxPeriodEnd').value;
    const format = document.getElementById('taxReportFormat').value;
    
    if (!periodStart || !periodEnd) {
        alert('Please select both start and end dates.');
        return;
    }
    
    if (new Date(periodStart) > new Date(periodEnd)) {
        alert('Start date cannot be after end date.');
        return;
    }
    
    // Show loading state
    const generateBtn = event.target;
    const originalContent = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
    generateBtn.disabled = true;
    
    // Determine API action based on tax type
    let action;
    switch(taxType) {
        case 'income-tax':
            action = 'generate_income_tax';
            break;
        case 'payroll-tax':
            action = 'generate_payroll_tax';
            break;
        case 'sales-tax':
            action = 'generate_sales_tax';
            break;
        default:
            alert('Invalid tax report type');
            generateBtn.innerHTML = originalContent;
            generateBtn.disabled = false;
            return;
    }
    
    // Make API call
    $.ajax({
        url: 'api/tax-reports.php',
        method: 'POST',
        data: {
            action: action,
            period_start: periodStart,
            period_end: periodEnd,
            format: format
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                if (format === 'json') {
                    // Show report in modal
                    displayTaxReport(response);
                } else {
                    // Download file
                    downloadTaxReport(response, format);
                }
                
                // Log to audit trail
                logAuditAction('Generate Tax Report', taxType, {
                    period: periodStart + ' to ' + periodEnd,
                    format: format
                });
                
                // Close modal and reset button state
                const modal = bootstrap.Modal.getInstance(document.getElementById('taxReportModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Ensure button state is reset
                const generateBtn = document.querySelector('#taxReportModal button[onclick*="generateTaxReport"]');
                if (generateBtn) {
                    generateBtn.innerHTML = '<i class="fas fa-file-download me-2"></i>Generate Report';
                    generateBtn.disabled = false;
                }
                
                // Refresh recent reports table
                loadRecentTaxReports();
                
            } else {
                alert('Error generating report: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Error generating report: ' + error);
            console.error('Tax report error:', xhr.responseText);
        },
        complete: function() {
            // Reset button state
            generateBtn.innerHTML = originalContent;
            generateBtn.disabled = false;
        }
    });
}

/**
 * Display tax report in modal
 */
function displayTaxReport(report) {
    let reportHtml = `
        <div class="tax-report-display">
            <div class="report-header mb-4">
                <h4 class="text-primary">${report.report_type}</h4>
                <p class="text-muted mb-0">Period: ${report.period}</p>
                <p class="text-muted mb-0">Generated: ${new Date(report.generated_at).toLocaleString()}</p>
            </div>
    `;
    
    // Generate content based on report type
    if (report.report_type === 'Income Tax Report') {
        reportHtml += `
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <h5 class="card-title text-success">Total Revenue</h5>
                            <h3 class="text-success">₱${formatNumber(report.total_revenue)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-danger">
                        <div class="card-body text-center">
                            <h5 class="card-title text-danger">Total Expenses</h5>
                            <h3 class="text-danger">₱${formatNumber(report.total_expenses)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <h5 class="card-title text-primary">Taxable Income</h5>
                            <h3 class="text-primary">₱${formatNumber(report.taxable_income)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-warning">
                        <div class="card-body text-center">
                            <h5 class="card-title text-warning">Estimated Tax (${report.tax_rate}%)</h5>
                            <h3 class="text-warning">₱${formatNumber(report.estimated_tax)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-calendar-alt me-2"></i>
                <strong>Filing Deadline:</strong> ${new Date(report.filing_deadline).toLocaleDateString()}
            </div>
        `;
        
        if (report.breakdown && report.breakdown.length > 0) {
            reportHtml += `
                <h5 class="mt-4">Revenue & Expense Breakdown</h5>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th>Category</th>
                                <th>Revenue</th>
                                <th>Expense</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            report.breakdown.forEach(item => {
                reportHtml += `
                    <tr>
                        <td>${item.code}</td>
                        <td>${item.name}</td>
                        <td><span class="badge bg-${item.category === 'revenue' ? 'success' : 'danger'}">${item.category}</span></td>
                        <td>${item.revenue_amount > 0 ? '₱' + formatNumber(item.revenue_amount) : '-'}</td>
                        <td>${item.expense_amount > 0 ? '₱' + formatNumber(item.expense_amount) : '-'}</td>
                    </tr>
                `;
            });
            
            reportHtml += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
    } else if (report.report_type === 'Payroll Tax Report') {
        reportHtml += `
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <h5 class="card-title text-primary">Total Gross Pay</h5>
                            <h3 class="text-primary">₱${formatNumber(report.total_gross_pay)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-danger">
                        <div class="card-body text-center">
                            <h5 class="card-title text-danger">Total Deductions</h5>
                            <h3 class="text-danger">₱${formatNumber(report.total_deductions)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <h5 class="card-title text-success">Total Net Pay</h5>
                            <h3 class="text-success">₱${formatNumber(report.total_net_pay)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <h5 class="mt-4">Tax Withholdings</h5>
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <h6 class="card-title">SSS (11%)</h6>
                            <h5 class="text-info">₱${formatNumber(report.tax_withholdings.sss_contribution)}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <h6 class="card-title">PhilHealth (3%)</h6>
                            <h5 class="text-info">₱${formatNumber(report.tax_withholdings.philhealth_contribution)}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <h6 class="card-title">Pag-IBIG (2%)</h6>
                            <h5 class="text-info">₱${formatNumber(report.tax_withholdings.pagibig_contribution)}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-warning">
                        <div class="card-body text-center">
                            <h6 class="card-title">Withholding Tax (15%)</h6>
                            <h5 class="text-warning">₱${formatNumber(report.tax_withholdings.withholding_tax)}</h5>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-warning">
                <h6><i class="fas fa-users me-2"></i>Total Tax Withheld: ₱${formatNumber(report.tax_withholdings.total_withheld)}</h6>
                <p class="mb-0">From ${report.total_employees} employees</p>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-calendar-alt me-2"></i>
                <strong>Filing Deadline:</strong> ${new Date(report.filing_deadline).toLocaleDateString()}
            </div>
        `;
        
    } else if (report.report_type === 'Sales Tax Report') {
        reportHtml += `
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <h5 class="card-title text-primary">Gross Sales</h5>
                            <h3 class="text-primary">₱${formatNumber(report.total_gross_sales)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <h5 class="card-title text-success">VAT Collected (${report.vat_rate}%)</h5>
                            <h3 class="text-success">₱${formatNumber(report.total_vat_collected)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <h5 class="card-title text-info">Net Sales</h5>
                            <h3 class="text-info">₱${formatNumber(report.net_sales)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-shopping-cart me-2"></i>
                <strong>Total Transactions:</strong> ${report.total_transactions}
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-calendar-alt me-2"></i>
                <strong>Filing Deadline:</strong> ${new Date(report.filing_deadline).toLocaleDateString()}
            </div>
        `;
    }
    
    reportHtml += `
        </div>
    `;
    
    // Show report in a new modal
    const reportModalHtml = `
        <div class="modal fade" id="taxReportDisplayModal" tabindex="-1" aria-labelledby="taxReportDisplayModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="taxReportDisplayModalLabel">
                            <i class="fas fa-file-invoice me-2"></i>${report.report_type}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${reportHtml}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="downloadTaxReport(${JSON.stringify(report).replace(/"/g, '&quot;')}, 'pdf')">
                            <i class="fas fa-download me-2"></i>Download PDF
                        </button>
                        <button type="button" class="btn btn-success" onclick="downloadTaxReport(${JSON.stringify(report).replace(/"/g, '&quot;')}, 'excel')">
                            <i class="fas fa-file-excel me-2"></i>Download Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('taxReportDisplayModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', reportModalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taxReportDisplayModal'));
    modal.show();
}

/**
 * Download tax report
 */
function downloadTaxReport(report, format) {
    // For now, create a simple text download
    // In a real implementation, you would call the API with format parameter
    let content = `${report.report_type}\n`;
    content += `Period: ${report.period}\n`;
    content += `Generated: ${report.generated_at}\n\n`;
    
    if (report.report_type === 'Income Tax Report') {
        content += `Total Revenue: ₱${formatNumber(report.total_revenue)}\n`;
        content += `Total Expenses: ₱${formatNumber(report.total_expenses)}\n`;
        content += `Taxable Income: ₱${formatNumber(report.taxable_income)}\n`;
        content += `Estimated Tax: ₱${formatNumber(report.estimated_tax)}\n`;
        content += `Filing Deadline: ${report.filing_deadline}\n`;
    } else if (report.report_type === 'Payroll Tax Report') {
        content += `Total Gross Pay: ₱${formatNumber(report.total_gross_pay)}\n`;
        content += `Total Deductions: ₱${formatNumber(report.total_deductions)}\n`;
        content += `Total Net Pay: ₱${formatNumber(report.total_net_pay)}\n`;
        content += `Total Tax Withheld: ₱${formatNumber(report.tax_withholdings.total_withheld)}\n`;
        content += `Filing Deadline: ${report.filing_deadline}\n`;
    } else if (report.report_type === 'Sales Tax Report') {
        content += `Gross Sales: ₱${formatNumber(report.total_gross_sales)}\n`;
        content += `VAT Collected: ₱${formatNumber(report.total_vat_collected)}\n`;
        content += `Net Sales: ₱${formatNumber(report.net_sales)}\n`;
        content += `Filing Deadline: ${report.filing_deadline}\n`;
    }
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`Tax report downloaded as ${format.toUpperCase()}`, 'success');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return new Intl.NumberFormat('en-PH').format(num);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 
                      type === 'warning' ? 'alert-warning' : 'alert-info';
    
    const notification = `
        <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * Load recent tax reports
 */
function loadRecentTaxReports() {
    $.ajax({
        url: 'api/tax-reports.php',
        method: 'GET',
        data: { action: 'get_recent_reports' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateTaxReportsTable(response.reports);
            } else {
                console.error('Error loading recent reports:', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading recent reports:', error);
        }
    });
}

/**
 * Refresh tax reports table
 */
function refreshTaxReports() {
    const refreshBtn = document.getElementById('refreshTaxReportsBtn');
    const icon = refreshBtn.querySelector('i');
    const originalText = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.disabled = true;
    icon.className = 'fas fa-spinner fa-spin me-1';
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...';
    
    // Load recent reports
    $.ajax({
        url: 'api/tax-reports.php',
        method: 'GET',
        data: { action: 'get_recent_reports' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateTaxReportsTable(response.reports);
                
                // Show success feedback
                icon.className = 'fas fa-check me-1';
                refreshBtn.innerHTML = '<i class="fas fa-check me-1"></i>Refreshed!';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = originalText;
                }, 2000);
                
                // Log to audit trail
                logAuditAction('Refresh Tax Reports', 'Recent Tax Reports');
                
            } else {
                console.error('Error loading recent reports:', response.message);
                showRefreshError();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading recent reports:', error);
            showRefreshError();
        }
    });
}

/**
 * Show refresh error
 */
function showRefreshError() {
    const refreshBtn = document.getElementById('refreshTaxReportsBtn');
    const icon = refreshBtn.querySelector('i');
    
    // Show error state
    icon.className = 'fas fa-exclamation-triangle me-1';
    refreshBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
    refreshBtn.classList.add('btn-outline-danger');
    refreshBtn.classList.remove('btn-outline-primary');
    
    // Reset button after 3 seconds
    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh';
        refreshBtn.classList.remove('btn-outline-danger');
        refreshBtn.classList.add('btn-outline-primary');
    }, 3000);
}

/**
 * Update tax reports table
 */
function updateTaxReportsTable(reports) {
    const tbody = document.querySelector('#taxReportsTable tbody');
    
    if (reports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-file-invoice fa-2x mb-2"></i>
                    <p>No tax reports generated yet</p>
                    <small>Generate your first tax report using the buttons above</small>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    reports.forEach(report => {
        const statusBadge = report.status === 'generated' ? 
            '<span class="badge bg-success">Generated</span>' :
            report.status === 'downloaded' ?
            '<span class="badge bg-info">Downloaded</span>' :
            '<span class="badge bg-secondary">Archived</span>';
        
        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas ${getTaxReportIcon(report.report_type)} me-2 text-primary"></i>
                        <div>
                            <strong>${report.report_type}</strong>
                            <br><small class="text-muted">${report.summary}</small>
                        </div>
                    </div>
                </td>
                <td><small class="text-muted">${report.period}</small></td>
                <td>
                    <small class="text-muted">${formatDateTime(report.generated_date)}</small>
                    <br><small class="text-muted">by ${report.generated_by}</small>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewTaxReport(${report.id})" title="View Report">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="downloadTaxReportById(${report.id})" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Get tax report icon
 */
function getTaxReportIcon(reportType) {
    if (reportType.includes('Income')) return 'fa-file-invoice';
    if (reportType.includes('Payroll')) return 'fa-users';
    if (reportType.includes('Sales')) return 'fa-shopping-cart';
    return 'fa-file-invoice';
}

/**
 * View tax report by ID
 */
function viewTaxReport(reportId) {
    $.ajax({
        url: 'api/tax-reports.php',
        method: 'GET',
        data: { action: 'get_tax_report', report_id: reportId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Convert the stored data back to the format expected by displayTaxReport
                const report = {
                    report_type: response.report.report_type,
                    period: response.report.period,
                    generated_at: response.report.generated_date,
                    ...response.report.data
                };
                displayTaxReport(report);
            } else {
                alert('Error loading report: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Error loading report: ' + error);
        }
    });
}

/**
 * Download tax report by ID
 */
function downloadTaxReportById(reportId) {
    $.ajax({
        url: 'api/tax-reports.php',
        method: 'GET',
        data: { action: 'get_tax_report', report_id: reportId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const report = {
                    report_type: response.report.report_type,
                    period: response.report.period,
                    generated_at: response.report.generated_date,
                    ...response.report.data
                };
                downloadTaxReport(report, 'pdf');
            } else {
                alert('Error loading report: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Error loading report: ' + error);
        }
    });
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
 * Load report settings
 */
function loadReportSettings() {
    $.ajax({
        url: 'api/report-settings.php',
        method: 'GET',
        data: { action: 'get_settings' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                populateSettingsForm(response.settings);
            } else {
                console.error('Error loading settings:', response.message);
                showSettingsError('Failed to load settings');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading settings:', error);
            showSettingsError('Connection error while loading settings');
        }
    });
}

/**
 * Populate settings form with loaded data
 */
function populateSettingsForm(settings) {
    // Basic settings
    if (settings.default_period) {
        document.getElementById('default-period').value = settings.default_period.value;
    }
    if (settings.default_format) {
        document.getElementById('default-format').value = settings.default_format.value;
    }
    if (settings.company_name) {
        document.getElementById('company-name').value = settings.company_name.value;
    }
    if (settings.fiscal_year_end) {
        document.getElementById('fiscal-year-end').value = settings.fiscal_year_end.value;
    }
    if (settings.footer_text) {
        document.getElementById('footer-text').value = settings.footer_text.value;
    }
    
    // Automated reports
    if (settings.auto_monthly) {
        document.getElementById('auto-monthly').checked = settings.auto_monthly.value;
    }
    if (settings.auto_quarterly) {
        document.getElementById('auto-quarterly').checked = settings.auto_quarterly.value;
    }
    if (settings.auto_yearend) {
        document.getElementById('auto-yearend').checked = settings.auto_yearend.value;
    }
    
    // Update settings summary
    const convertedSettings = convertSettingsForSummary(settings);
    updateSettingsSummary(convertedSettings);
}

/**
 * Save settings
 */
function saveSettings() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    const originalText = saveBtn.innerHTML;
    
    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    
    // Collect all settings
    const settings = {
        default_period: document.getElementById('default-period').value,
        default_format: document.getElementById('default-format').value,
        company_name: document.getElementById('company-name').value,
        fiscal_year_end: document.getElementById('fiscal-year-end').value,
        footer_text: document.getElementById('footer-text').value,
        auto_monthly: document.getElementById('auto-monthly').checked,
        auto_quarterly: document.getElementById('auto-quarterly').checked,
        auto_yearend: document.getElementById('auto-yearend').checked
    };
    
    // Validate settings
    if (!validateSettings(settings)) {
        resetSaveButton(saveBtn, originalText);
        return;
    }
    
    $.ajax({
        url: 'api/report-settings.php',
        method: 'POST',
        data: { 
            action: 'save_settings',
            settings: settings
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Show success state
                saveBtn.innerHTML = '<i class="fas fa-check me-2"></i>Saved!';
                saveBtn.classList.remove('btn-primary');
                saveBtn.classList.add('btn-success');
                
                // Show success notification
                showSettingsSuccess('Settings saved successfully!');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                    saveBtn.classList.remove('btn-success');
                    saveBtn.classList.add('btn-primary');
                }, 2000);
    
                // Log to audit trail
                logAuditAction('Update Settings', 'Report Configuration', settings);
                
                // Update settings summary after successful save
                updateSettingsSummary(settings);
                
            } else {
                showSettingsError('Failed to save settings: ' + response.message);
                resetSaveButton(saveBtn, originalText);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error saving settings:', error);
            showSettingsError('Connection error while saving settings');
            resetSaveButton(saveBtn, originalText);
        }
    });
}

/**
 * Validate settings
 */
function validateSettings(settings) {
    // Validate company name
    if (!settings.company_name || settings.company_name.trim().length < 2) {
        showSettingsError('Company name must be at least 2 characters long');
        return false;
    }
    
    // Validate fiscal year end
    if (!settings.fiscal_year_end) {
        showSettingsError('Fiscal year end date is required');
        return false;
    }
    
    return true;
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        return;
    }
    
    const resetBtn = document.getElementById('resetSettingsBtn');
    const originalText = resetBtn.innerHTML;
    
    // Show loading state
    resetBtn.disabled = true;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Resetting...';
    
    $.ajax({
        url: 'api/report-settings.php',
        method: 'POST',
        data: { action: 'reset_settings' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Reload settings
                loadReportSettings();
                
                // Show success state
                resetBtn.innerHTML = '<i class="fas fa-check me-2"></i>Reset!';
                resetBtn.classList.remove('btn-outline-warning');
                resetBtn.classList.add('btn-success');
                
                // Show success notification
                showSettingsSuccess('Settings reset to defaults successfully!');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    resetBtn.disabled = false;
                    resetBtn.innerHTML = originalText;
                    resetBtn.classList.remove('btn-success');
                    resetBtn.classList.add('btn-outline-warning');
                }, 2000);
                
                // Log to audit trail
                logAuditAction('Reset Settings', 'Report Configuration');
                
            } else {
                showSettingsError('Failed to reset settings: ' + response.message);
                resetSaveButton(resetBtn, originalText);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error resetting settings:', error);
            showSettingsError('Connection error while resetting settings');
            resetSaveButton(resetBtn, originalText);
        }
    });
}

/**
 * Reset save button to original state
 */
function resetSaveButton(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
    button.classList.remove('btn-success', 'btn-danger');
    button.classList.add('btn-primary');
}

/**
 * Show settings success message
 */
function showSettingsSuccess(message) {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Remove existing alerts
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Add new alert
    const settingsContainer = document.querySelector('.settings-container');
    settingsContainer.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * Show settings error message
 */
function showSettingsError(message) {
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Remove existing alerts
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Add new alert
    const settingsContainer = document.querySelector('.settings-container');
    settingsContainer.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 8000);
}

/**
 * Add event listeners to toggle buttons for auto-save
 */
function addToggleEventListeners() {
    // Add event listeners to automation toggles
    const toggles = ['auto-monthly', 'auto-quarterly', 'auto-yearend'];
    
    toggles.forEach(toggleId => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('change', function() {
                // Auto-save when toggle changes
                saveSettings();
            });
        }
    });
}

/**
 * Convert settings from API format to summary format
 */
function convertSettingsForSummary(apiSettings) {
    const converted = {};
    
    // Convert API response format to simple format
    for (const [key, setting] of Object.entries(apiSettings)) {
        if (setting && typeof setting === 'object' && 'value' in setting) {
            converted[key] = setting.value;
        } else {
            converted[key] = setting;
        }
    }
    
    return converted;
}

/**
 * Update settings summary
 */
function updateSettingsSummary(settings) {
    // Update basic configuration
    if (settings.default_period) {
        document.getElementById('summary-period').textContent = settings.default_period;
    }
    if (settings.default_format) {
        document.getElementById('summary-format').textContent = settings.default_format;
    }
    if (settings.company_name) {
        document.getElementById('summary-company').textContent = settings.company_name;
    }
    
    // Update automation status
    if (settings.auto_monthly !== undefined) {
        const status = settings.auto_monthly ? 'Enabled' : 'Disabled';
        const color = settings.auto_monthly ? 'text-success' : 'text-muted';
        document.getElementById('summary-monthly').innerHTML = `<span class="${color}">${status}</span>`;
    }
    if (settings.auto_quarterly !== undefined) {
        const status = settings.auto_quarterly ? 'Enabled' : 'Disabled';
        const color = settings.auto_quarterly ? 'text-success' : 'text-muted';
        document.getElementById('summary-quarterly').innerHTML = `<span class="${color}">${status}</span>`;
    }
    if (settings.auto_yearend !== undefined) {
        const status = settings.auto_yearend ? 'Enabled' : 'Disabled';
        const color = settings.auto_yearend ? 'text-success' : 'text-muted';
        document.getElementById('summary-yearend').innerHTML = `<span class="${color}">${status}</span>`;
    }
}
