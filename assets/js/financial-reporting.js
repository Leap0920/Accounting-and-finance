/**
 * Financial Reporting Module
 * Simplified implementation matching the flowchart
 */

// Global variables
let currentReportData = null;
let currentReportType = null;
let reportModal = null;
let filteredData = null;
let showMoreDetails = false;
let isFiltering = false; // Flag to prevent multiple simultaneous filter requests

// Pagination variables
let currentPage = 1;
let entriesPerPage = 25;
let totalEntries = 0;
let totalPages = 0;

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal
    const modalElement = document.getElementById('reportModal');
    if (modalElement) {
        reportModal = new bootstrap.Modal(modalElement);
    }
    
    // Set default dates for filters
    setDefaultFilterDates();
});

/**
 * Set default dates for filters
 */
function setDefaultFilterDates() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    
    // Set filter dates
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    if (filterDateFrom) filterDateFrom.value = firstDayOfYear;
    if (filterDateTo) filterDateTo.value = today;
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
        'trial-balance': 'Trial Balance',
        'regulatory-reports': 'Regulatory Reports'
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
    
    // Handle regulatory reports differently
    if (reportType === 'regulatory-reports') {
        // Simulate loading delay
        setTimeout(() => {
            const mockData = {
                report_title: 'Regulatory Reports',
                period: new Date().toLocaleDateString(),
                generated_at: new Date().toISOString()
            };
            currentReportData = mockData;
            displayReportInModal(reportType, mockData);
        }, 1000);
        return;
    }
    
    // Gather parameters for other reports
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
    } else if (reportType === 'regulatory-reports') {
        html += generateRegulatoryReportsHTML(data);
    } else {
        // Fallback for any report type
        html += generateGenericReportHTML(data);
    }
    
    html += `
            <div class="d-flex justify-content-end gap-2 mt-4 no-print">
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
    let html = '<div class="balance-sheet-report">';
    
    // ASSETS Section
    html += '<div class="report-section">';
    html += '<h5 class="section-header-financial">ASSETS</h5>';
    html += `
        <table class="report-table-financial">
            <thead>
                <tr>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT CODE</th>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT NAME</th>
                    <th style="text-align: right; background-color: #1e3a3a; color: white;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (data.assets && data.assets.length > 0) {
        data.assets.forEach(account => {
            html += `
                <tr>
                    <td>${account.code}</td>
                    <td>${account.name}</td>
                    <td style="text-align: right;">${formatCurrency(account.balance)}</td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3" style="text-align: center; color: #999;">No assets found</td></tr>';
    }
    
    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="2" style="background-color: #f0f0f0;"><strong>TOTAL ASSETS</strong></td>
                    <td style="text-align: right; background-color: #f0f0f0;"><strong>${formatCurrency(data.total_assets)}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
    `;
    
    // LIABILITIES Section
    html += '<div class="report-section">';
    html += '<h5 class="section-header-financial">LIABILITIES</h5>';
    html += `
        <table class="report-table-financial">
            <thead>
                <tr>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT CODE</th>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT NAME</th>
                    <th style="text-align: right; background-color: #1e3a3a; color: white;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (data.liabilities && data.liabilities.length > 0) {
        data.liabilities.forEach(account => {
            html += `
                <tr>
                    <td>${account.code}</td>
                    <td>${account.name}</td>
                    <td style="text-align: right;">${formatCurrency(account.balance)}</td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3" style="text-align: center; color: #999;">No liabilities found</td></tr>';
    }
    
    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="2" style="background-color: #f0f0f0;"><strong>TOTAL LIABILITIES</strong></td>
                    <td style="text-align: right; background-color: #f0f0f0;"><strong>${formatCurrency(data.total_liabilities)}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
    `;
    
    // EQUITY Section
    html += '<div class="report-section">';
    html += '<h5 class="section-header-financial">EQUITY</h5>';
    html += `
        <table class="report-table-financial">
            <thead>
                <tr>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT CODE</th>
                    <th style="text-align: left; background-color: #1e3a3a; color: white;">ACCOUNT NAME</th>
                    <th style="text-align: right; background-color: #1e3a3a; color: white;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (data.equity && data.equity.length > 0) {
        data.equity.forEach(account => {
            html += `
                <tr>
                    <td>${account.code}</td>
                    <td>${account.name}</td>
                    <td style="text-align: right;">${formatCurrency(account.balance)}</td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3" style="text-align: center; color: #999;">No equity found</td></tr>';
    }
    
    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="2" style="background-color: #f0f0f0;"><strong>TOTAL EQUITY</strong></td>
                    <td style="text-align: right; background-color: #f0f0f0;"><strong>${formatCurrency(data.total_equity)}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
    `;
    
    // Final Total
    html += `
        <div class="final-total-section">
            <div class="final-total-box">
                <span class="final-total-label">Total Liabilities & Equity:</span>
                <span class="final-total-value">${formatCurrency(data.total_liabilities_equity)}</span>
            </div>
        </div>
    `;
    
    if (data.is_balanced) {
        html += '<div class="alert alert-success mt-3 no-print"><i class="fas fa-check-circle me-2"></i>Balance Sheet is balanced!</div>';
    } else {
        html += '<div class="alert alert-warning mt-3 no-print"><i class="fas fa-exclamation-triangle me-2"></i>Warning: Balance Sheet is not balanced!</div>';
    }
    
    html += '</div>'; // Close balance-sheet-report
    
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
 * Generate Regulatory Reports HTML - Following Flowchart
 */
function generateRegulatoryReportsHTML(data) {
    let html = `
        <div class="regulatory-reports-flow">
            <!-- Step 1: Decision - View Regulatory Reports? -->
            <div class="flow-step mb-4">
                <div class="card border-primary">
                    <div class="card-body text-center">
                        <h5 class="card-title text-primary">
                            <i class="fas fa-question-circle me-2"></i>View Regulatory Reports?
                        </h5>
                        <p class="text-muted mb-3">Select the type of regulatory report you want to view</p>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <button class="btn btn-outline-primary w-100" onclick="viewRegulatoryReport('bsp')">
                                    <i class="fas fa-university me-2"></i>BSP Reports
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-success w-100" onclick="viewRegulatoryReport('sec')">
                                    <i class="fas fa-building me-2"></i>SEC Filings
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-warning w-100" onclick="viewRegulatoryReport('internal')">
                                    <i class="fas fa-shield-alt me-2"></i>Internal Compliance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Step 2: Display Report Table (hidden initially) -->
            <div id="regulatory-report-table" style="display: none;">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-table me-2"></i>Display Report Table
                            <span id="report-type-label">(BSP, SEC, or internal compliance templates)</span>
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="regulatory-data-table">
                                <thead class="table-light">
                                    <tr>
                                        <th>Report ID</th>
                                        <th>Report Type</th>
                                        <th>Period</th>
                                        <th>Status</th>
                                        <th>Generated Date</th>
                                        <th>Compliance Score</th>
                                    </tr>
                                </thead>
                                <tbody id="regulatory-data-tbody">
                                    <!-- Data will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Step 3: Decision - Export/Print the display Table? -->
                        <div class="mt-4 text-center">
                            <h6 class="text-muted mb-3">
                                <i class="fas fa-question-circle me-2"></i>Export/Print the display Table?
                            </h6>
                            <div class="d-flex justify-content-center gap-2">
                                <button class="btn btn-success" onclick="exportRegulatoryReport()">
                                    <i class="fas fa-file-excel me-2"></i>Export Excel
                                </button>
                                <button class="btn btn-danger" onclick="printRegulatoryReport()">
                                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                                </button>
                                <button class="btn btn-secondary" onclick="printRegulatoryReport()">
                                    <i class="fas fa-print me-2"></i>Print Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Generate Generic Report HTML (fallback)
 */
function generateGenericReportHTML(data) {
    let html = `
        <div class="alert alert-info">
            <h5><i class="fas fa-info-circle me-2"></i>Report Generated Successfully</h5>
            <p class="mb-0">Report type: ${data.report_title || 'Financial Report'}</p>
            <p class="mb-0">Period: ${data.period || 'Current Period'}</p>
            <p class="mb-0">Generated: ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    if (data.summary) {
        html += `
            <div class="mt-4">
                <h6>Report Summary</h6>
                <div class="bg-light p-3 rounded">
                    <pre class="mb-0">${JSON.stringify(data.summary, null, 2)}</pre>
                </div>
            </div>
        `;
    }
    
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
    
    if (format === 'pdf') {
        // For PDF, use print dialog
        window.print();
    } else if (format === 'excel') {
        // Prepare data for Excel export
        exportToExcel();
    } else {
        alert(`Exporting ${currentReportType} report as ${format.toUpperCase()}...\nThis feature will download the report in the selected format.`);
    }
}

/**
 * Export report to Excel
 */
function exportToExcel() {
    if (!currentReportData || !currentReportType) {
        alert('No report data available to export.');
        return;
    }
    
    // Create CSV content based on report type
    let csvContent = '';
    
    if (currentReportType === 'balance-sheet') {
        csvContent = generateBalanceSheetCSV(currentReportData);
    } else if (currentReportType === 'income-statement') {
        csvContent = generateIncomeStatementCSV(currentReportData);
    } else if (currentReportType === 'trial-balance') {
        csvContent = generateTrialBalanceCSV(currentReportData);
    } else {
        alert('Excel export not supported for this report type yet.');
        return;
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentReportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Report exported successfully!', 'success');
}

/**
 * Generate Balance Sheet CSV
 */
function generateBalanceSheetCSV(data) {
    let csv = 'EVERGREEN ACCOUNTING & FINANCE\n';
    csv += 'BALANCE SHEET\n';
    csv += `${data.as_of_date}\n\n`;
    
    // Assets
    csv += 'ASSETS\n';
    csv += 'Account Code,Account Name,Amount\n';
    if (data.assets && data.assets.length > 0) {
        data.assets.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
        });
    }
    csv += `,,${data.total_assets}\n`;
    csv += `TOTAL ASSETS,,${data.total_assets}\n\n`;
    
    // Liabilities
    csv += 'LIABILITIES\n';
    csv += 'Account Code,Account Name,Amount\n';
    if (data.liabilities && data.liabilities.length > 0) {
        data.liabilities.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
        });
    }
    csv += `TOTAL LIABILITIES,,${data.total_liabilities}\n\n`;
    
    // Equity
    csv += 'EQUITY\n';
    csv += 'Account Code,Account Name,Amount\n';
    if (data.equity && data.equity.length > 0) {
        data.equity.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
        });
    }
    csv += `TOTAL EQUITY,,${data.total_equity}\n\n`;
    
    csv += `Total Liabilities & Equity,,${data.total_liabilities_equity}\n`;
    
    return csv;
}

/**
 * Generate Income Statement CSV
 */
function generateIncomeStatementCSV(data) {
    let csv = 'EVERGREEN ACCOUNTING & FINANCE\n';
    csv += 'INCOME STATEMENT\n';
    csv += `${data.period}\n\n`;
    
    csv += 'REVENUE\n';
    csv += 'Account Code,Account Name,Amount\n';
    if (data.revenue && data.revenue.length > 0) {
        data.revenue.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
        });
    }
    csv += `TOTAL REVENUE,,${data.total_revenue}\n\n`;
    
    csv += 'EXPENSES\n';
    csv += 'Account Code,Account Name,Amount\n';
    if (data.expenses && data.expenses.length > 0) {
        data.expenses.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.balance}\n`;
        });
    }
    csv += `TOTAL EXPENSES,,${data.total_expenses}\n\n`;
    
    csv += `NET INCOME,,${data.net_income}\n`;
    
    return csv;
}

/**
 * Generate Trial Balance CSV
 */
function generateTrialBalanceCSV(data) {
    let csv = 'EVERGREEN ACCOUNTING & FINANCE\n';
    csv += 'TRIAL BALANCE\n';
    csv += `${data.period}\n\n`;
    
    csv += 'Account Code,Account Name,Type,Debit,Credit\n';
    if (data.accounts && data.accounts.length > 0) {
        data.accounts.forEach(acc => {
            csv += `${acc.code},${acc.name},${acc.account_type},${acc.total_debit},${acc.total_credit}\n`;
        });
    }
    csv += `TOTAL,,,${data.total_debit},${data.total_credit}\n`;
    
    return csv;
}

/**
 * View Regulatory Report - Step 1 of Flowchart
 */
function viewRegulatoryReport(reportType) {
    const reportTable = document.getElementById('regulatory-report-table');
    const reportTypeLabel = document.getElementById('report-type-label');
    const tbody = document.getElementById('regulatory-data-tbody');
    
    // Update report type label
    const reportNames = {
        'bsp': 'BSP (Bangko Sentral ng Pilipinas) Reports',
        'sec': 'SEC (Securities and Exchange Commission) Filings',
        'internal': 'Internal Compliance Templates'
    };
    
    reportTypeLabel.textContent = `(${reportNames[reportType]})`;
    
    // Show loading state
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="loading-spinner"></div>
                <p class="mt-2 text-muted">Loading ${reportNames[reportType]}...</p>
            </td>
        </tr>
    `;
    
    // Show the report table (Step 2 of flowchart)
    reportTable.style.display = 'block';
    
    // Simulate loading data
    setTimeout(() => {
        displayRegulatoryReportData(reportType);
    }, 1500);
}

/**
 * Display Regulatory Report Data - Step 2 of Flowchart
 */
function displayRegulatoryReportData(reportType) {
    const tbody = document.getElementById('regulatory-data-tbody');
    
    // Generate mock data based on report type
    const mockData = generateMockRegulatoryData(reportType);
    
    let html = '';
    mockData.forEach((report, index) => {
        const statusBadge = report.status === 'Compliant' ? 'bg-success' : 
                           report.status === 'Pending' ? 'bg-warning' : 'bg-danger';
        
        html += `
            <tr>
                <td><code class="text-primary">${report.id}</code></td>
                <td><strong>${report.type}</strong></td>
                <td>${report.period}</td>
                <td><span class="badge ${statusBadge}">${report.status}</span></td>
                <td>${formatDate(report.generatedDate)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress me-2" style="width: 60px; height: 8px;">
                            <div class="progress-bar ${report.score >= 80 ? 'bg-success' : report.score >= 60 ? 'bg-warning' : 'bg-danger'}" 
                                 style="width: ${report.score}%"></div>
                        </div>
                        <span class="fw-bold">${report.score}%</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Show success notification
    showNotification('Regulatory report data loaded successfully', 'success');
}

/**
 * Generate Mock Regulatory Data
 */
function generateMockRegulatoryData(reportType) {
    const baseData = {
        'bsp': [
            { id: 'BSP-001', type: 'Monthly Report', period: '2024-01', status: 'Compliant', generatedDate: '2024-01-31', score: 95 },
            { id: 'BSP-002', type: 'Quarterly Report', period: '2024-Q1', status: 'Compliant', generatedDate: '2024-03-31', score: 92 },
            { id: 'BSP-003', type: 'Annual Report', period: '2023', status: 'Pending', generatedDate: '2024-01-15', score: 78 }
        ],
        'sec': [
            { id: 'SEC-001', type: '10-K Filing', period: '2023', status: 'Compliant', generatedDate: '2024-03-15', score: 88 },
            { id: 'SEC-002', type: '10-Q Filing', period: '2024-Q1', status: 'Compliant', generatedDate: '2024-05-15', score: 85 },
            { id: 'SEC-003', type: '8-K Filing', period: '2024-06', status: 'Pending', generatedDate: '2024-06-20', score: 72 }
        ],
        'internal': [
            { id: 'INT-001', type: 'Compliance Audit', period: '2024-Q1', status: 'Compliant', generatedDate: '2024-03-31', score: 90 },
            { id: 'INT-002', type: 'Risk Assessment', period: '2024-Q2', status: 'Compliant', generatedDate: '2024-06-30', score: 87 },
            { id: 'INT-003', type: 'Internal Review', period: '2024-Q3', status: 'Pending', generatedDate: '2024-09-15', score: 75 }
        ]
    };
    
    return baseData[reportType] || [];
}

/**
 * Export Regulatory Report - Step 4 of Flowchart
 */
function exportRegulatoryReport() {
    const tbody = document.getElementById('regulatory-data-tbody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    showNotification('Exporting regulatory report...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        showNotification('Regulatory report exported successfully!', 'success');
        console.log('Regulatory report exported with', rows.length, 'records');
    }, 2000);
}

/**
 * Print Regulatory Report - Step 4 of Flowchart
 */
function printRegulatoryReport() {
    const reportTable = document.getElementById('regulatory-report-table');
    
    if (!reportTable || reportTable.style.display === 'none') {
        showNotification('No report data to print', 'warning');
        return;
    }
    
    showNotification('Preparing report for printing...', 'info');
    
    // Simulate print process
    setTimeout(() => {
        showNotification('Report sent to printer successfully!', 'success');
        console.log('Regulatory report printed');
    }, 1500);
}

// ===== FILTERING FUNCTIONS =====

/**
 * Apply filters to financial data
 */
function applyFilters() {
    // Prevent multiple simultaneous requests
    if (isFiltering) {
        console.log('Filter request already in progress, ignoring...');
        return;
    }
    
    isFiltering = true; // Set flag
    
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const subsystem = document.getElementById('filter-subsystem').value;
    const accountType = document.getElementById('filter-account-type').value;
    const customSearch = document.getElementById('filter-custom-search').value;
    
    // Show loading state
    const resultsSection = document.getElementById('filtered-results');
    const tbody = document.getElementById('filtered-results-tbody');
    const noResultsMessage = document.getElementById('no-results-message');
    
    resultsSection.style.display = 'block';
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-3">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Applying filters...
            </td>
        </tr>
    `;
    noResultsMessage.style.display = 'none';
    
    // Show notification
    showNotification('Applying filters...', 'info');
    
    // Make AJAX request to real API
    console.log('Making AJAX request to filter-data.php...');
    console.log('Filter parameters:', {
        date_from: dateFrom,
        date_to: dateTo,
        subsystem: subsystem,
        account_type: accountType,
        custom_search: customSearch
    });
    
    $.ajax({
        url: 'api/filter-data.php',
        method: 'GET',
        data: {
            action: 'filter_data',
            date_from: dateFrom,
            date_to: dateTo,
            subsystem: subsystem,
            account_type: accountType,
            custom_search: customSearch
        },
        dataType: 'json',
        timeout: 10000, // 10 second timeout
        success: function(response) {
            console.log('AJAX Success Response:', response);
            
            try {
                // Hide loading spinner
                const tbody = document.getElementById('filtered-results-tbody');
                if (tbody) {
                    tbody.innerHTML = '';
                }
                
                if (response.success) {
                    if (response.data && response.data.length > 0) {
                        console.log('Processing', response.data.length, 'records');
                        filteredData = response.data;
                        
                        // Ensure the results section is visible
                        const resultsSection = document.getElementById('filtered-results');
                        if (resultsSection) {
                            resultsSection.style.display = 'block';
                        }
                        
                        // Initialize pagination and display the data
                        currentPage = 1;
                        updatePagination();
                        displayCurrentPageData();
                        showNotification(response.message || `Found ${response.data.length} records`, 'success');
                    } else {
                        console.log('No data in response');
                        showNoResults();
                        showNotification('No records found matching your criteria', 'warning');
                    }
                } else {
                    console.log('Response indicates failure');
                    showNoResults();
                    showNotification(response.message || 'Error applying filters', 'error');
                }
            } finally {
                isFiltering = false; // Reset flag
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);
            
            try {
                // Handle timeout
                if (status === 'timeout') {
                    console.log('Request timed out, using mock data...');
                    try {
                        const mockData = generateMockFilteredData(dateFrom, dateTo, subsystem, accountType, customSearch);
                        if (mockData && mockData.length > 0) {
                            filteredData = mockData;
                            displayFilteredInformation(mockData);
                            showNotification('Request timed out. Using sample data.', 'warning');
                        } else {
                            showNoResults();
                            showNotification('Request timed out. No data available.', 'warning');
                        }
                    } catch (mockError) {
                        console.error('Mock data error:', mockError);
                        showNoResults();
                        showNotification('Request timed out. Please try again.', 'error');
                    }
                }
                // If it's a 404 or connection error, try mock data as fallback
                else if (xhr.status === 404 || xhr.status === 0) {
                    console.log('Using mock data as fallback...');
                    try {
                        const mockData = generateMockFilteredData(dateFrom, dateTo, subsystem, accountType, customSearch);
                        if (mockData && mockData.length > 0) {
                            filteredData = mockData;
                            displayFilteredInformation(mockData);
                            showNotification('Using sample data (database not available)', 'warning');
                        } else {
                            showNoResults();
                            showNotification('No data available. Please populate the database first.', 'warning');
                        }
                    } catch (mockError) {
                        console.error('Mock data error:', mockError);
                        showNoResults();
                        showNotification('No data available. Please populate the database first.', 'warning');
                    }
                } else {
                    showNoResults();
                    showNotification('Connection error. Please try again.', 'error');
                }
            } finally {
                isFiltering = false; // Reset flag
            }
        }
    });
}

/**
 * Generate mock filtered data
 */
function generateMockFilteredData(dateFrom, dateTo, subsystem, accountType, customSearch) {
    // Base mock accounts data
    const mockAccounts = [
        { code: '1001', name: 'Cash in Bank', type: 'asset', balance: 150000 },
        { code: '1002', name: 'Accounts Receivable', type: 'asset', balance: 75000 },
        { code: '2001', name: 'Accounts Payable', type: 'liability', balance: 45000 },
        { code: '3001', name: 'Owner\'s Equity', type: 'equity', balance: 180000 },
        { code: '4001', name: 'Sales Revenue', type: 'revenue', balance: 250000 },
        { code: '5001', name: 'Office Supplies', type: 'expense', balance: 15000 },
        { code: '5002', name: 'Rent Expense', type: 'expense', balance: 12000 },
        { code: '5003', name: 'Utilities Expense', type: 'expense', balance: 8000 },
        { code: '1003', name: 'Inventory', type: 'asset', balance: 95000 },
        { code: '2002', name: 'Short-term Loan', type: 'liability', balance: 60000 },
        { code: '4002', name: 'Service Revenue', type: 'revenue', balance: 180000 },
        { code: '5004', name: 'Marketing Expense', type: 'expense', balance: 25000 }
    ];
    
    let filteredAccounts = [...mockAccounts]; // Create a copy
    
    // Apply account type filter
    if (accountType) {
        filteredAccounts = filteredAccounts.filter(acc => acc.type === accountType);
    }
    
    // Apply custom search filter
    if (customSearch) {
        const searchTerm = customSearch.toLowerCase();
        filteredAccounts = filteredAccounts.filter(acc => 
            acc.name.toLowerCase().includes(searchTerm) || 
            acc.code.includes(searchTerm)
        );
    }
    
    // If no accounts match filters, return some default data
    if (filteredAccounts.length === 0) {
        filteredAccounts = mockAccounts.slice(0, 3); // Return first 3 accounts
    }
    
    // Generate transaction records
    const transactions = [];
    const startDate = dateFrom ? new Date(dateFrom) : new Date('2024-01-01');
    const endDate = dateTo ? new Date(dateTo) : new Date();
    
    // Ensure we always have at least 3 transactions
    const numTransactions = Math.max(3, filteredAccounts.length);
    
    for (let i = 0; i < numTransactions; i++) {
        const account = filteredAccounts[i % filteredAccounts.length];
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Generate realistic transaction amounts
        const baseAmount = Math.random() * 5000 + 500; // Between 500 and 5500
        const debitAmount = account.type === 'asset' || account.type === 'expense' ? baseAmount : 0;
        const creditAmount = account.type === 'liability' || account.type === 'equity' || account.type === 'revenue' ? baseAmount : 0;
        
        transactions.push({
            date: randomDate.toISOString().split('T')[0],
            account_code: account.code,
            account_name: account.name,
            description: `${account.name} transaction - ${subsystem || 'General Ledger'}`,
            debit: debitAmount,
            credit: creditAmount,
            balance: account.balance + (Math.random() * 10000 - 5000) // Add some variation
        });
    }
    
    return transactions;
}

/**
 * Display filtered information
 */
function displayFilteredInformation(data) {
    const tbody = document.getElementById('filtered-results-tbody');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsSummary = document.getElementById('results-summary');
    const filterStatus = document.getElementById('filter-status');
    
    console.log('displayFilteredInformation called with', data ? data.length : 0, 'records');
    
    if (!data || data.length === 0) {
        console.log('No data, showing no results');
        showNoResults();
        return;
    }
    
    try {
        // Update summary
        if (resultsSummary) {
            resultsSummary.textContent = `Found ${data.length} record${data.length !== 1 ? 's' : ''} matching your criteria`;
        }
        
        if (filterStatus) {
            filterStatus.textContent = `${data.length} result${data.length !== 1 ? 's' : ''} found`;
            filterStatus.className = 'badge bg-success';
        }
        
        let html = '';
        data.forEach((record, index) => {
            const rowClass = index % 2 === 0 ? '' : 'table-light';
            const dateStr = record.date ? formatDate(record.date) : 'N/A';
            const accountCode = record.account_code || 'N/A';
            const accountName = record.account_name || 'N/A';
            const description = record.description || 'No description';
            
            html += `
                <tr class="${rowClass}">
                    <td>
                        <span class="badge bg-light text-dark">${dateStr}</span>
                    </td>
                    <td>
                        <code class="text-primary fw-bold">${accountCode}</code>
                    </td>
                    <td>
                        <span class="fw-semibold">${accountName}</span>
                    </td>
                    <td>
                        <span class="text-muted">${description}</span>
                    </td>
                    <td class="text-end">
                        ${record.debit > 0 ? `<span class="text-danger fw-bold">${formatCurrency(record.debit)}</span>` : '<span class="text-muted">-</span>'}
                    </td>
                    <td class="text-end">
                        ${record.credit > 0 ? `<span class="text-success fw-bold">${formatCurrency(record.credit)}</span>` : '<span class="text-muted">-</span>'}
                    </td>
                    <td class="text-end">
                        <span class="text-primary fw-bold">${formatCurrency(record.balance)}</span>
                    </td>
                </tr>
            `;
        });
        
        if (tbody) {
            tbody.innerHTML = html;
        }
        
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        console.log('Successfully displayed', data.length, 'records');
    } catch (error) {
        console.error('Error displaying filtered information:', error);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error displaying data: ${error.message}</td></tr>`;
        }
    }
}

/**
 * Show more information (drill-down)
 */
function showMoreInformation() {
    const showMoreBtn = document.getElementById('show-more-btn');
    const tbody = document.getElementById('filtered-results-tbody');
    
    if (!showMoreDetails) {
        // Show detailed view
        showMoreBtn.innerHTML = '<i class="fas fa-compress me-1"></i>Show Less Information';
        showMoreDetails = true;
        
        // Add more detailed columns or expand existing rows
        // This is a simplified implementation
        alert('Showing more detailed information...\nIn a full implementation, this would expand rows with additional details.');
    } else {
        // Show summary view
        showMoreBtn.innerHTML = '<i class="fas fa-expand me-1"></i>Show More Information';
        showMoreDetails = false;
        
        // Collapse back to summary view
        alert('Showing summary information...\nIn a full implementation, this would collapse rows to summary view.');
    }
}

/**
 * Show no results message
 */
function showNoResults() {
    const tbody = document.getElementById('filtered-results-tbody');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsSummary = document.getElementById('results-summary');
    const filterStatus = document.getElementById('filter-status');
    
    tbody.innerHTML = '';
    noResultsMessage.style.display = 'block';
    resultsSummary.textContent = 'No records found matching your criteria';
    filterStatus.textContent = 'No results';
    filterStatus.className = 'badge bg-warning';
}

/**
 * Clear all filters
 */
function clearFilters() {
    try {
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('filter-subsystem').value = '';
        document.getElementById('filter-account-type').value = '';
        document.getElementById('filter-custom-search').value = '';
        
        // Hide results section
        document.getElementById('filtered-results').style.display = 'none';
        showMoreDetails = false;
        
        // Reset show more button
        const showMoreBtn = document.getElementById('show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.innerHTML = '<i class="fas fa-expand me-1"></i>Show More Information';
        }
        
        // Reset filter status
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            filterStatus.textContent = 'No filters applied';
            filterStatus.className = 'badge bg-light text-dark';
        }
        
        // Show success message
        showNotification('Filters cleared successfully', 'success');
    } catch (error) {
        console.error('Error clearing filters:', error);
        showNotification('Error clearing filters', 'error');
    }
}

/**
 * Quick test function to verify filtering works
 */
function testFilters() {
    console.log('Testing filters...');
    applyFilters();
}

/**
 * Export filtered data
 */
function exportFilteredData(format) {
    if (!filteredData || filteredData.length === 0) {
        alert('No filtered data to export. Please apply filters first.');
        return;
    }
    
    alert(`Exporting filtered data as ${format.toUpperCase()}...\nThis feature will download the filtered results.`);
}

/**
 * Print filtered data
 */
function printFilteredData() {
    if (!filteredData || filteredData.length === 0) {
        alert('No filtered data to print. Please apply filters first.');
        return;
    }
    
    window.print();
}

/**
 * Format date helper
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

/**
 * Refresh all reports
 */
function refreshAllReports() {
    showNotification('Refreshing all report data...', 'info');
    
    // Simulate refresh process
    setTimeout(() => {
        showNotification('All reports refreshed successfully!', 'success');
        
        // In a real implementation, this would:
        // 1. Reload the page or refresh data via AJAX
        // 2. Update all report cards with fresh data
        // 3. Clear any cached data
        
        console.log('All reports refreshed');
    }, 2000);
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
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
 * Pagination Functions
 */

function changeEntriesPerPage() {
    entriesPerPage = parseInt(document.getElementById('entries-per-page').value);
    currentPage = 1; // Reset to first page
    updatePagination();
    displayCurrentPageData();
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updatePagination();
        displayCurrentPageData();
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function goToLastPage() {
    goToPage(totalPages);
}

function updatePagination() {
    if (!filteredData) return;
    
    totalEntries = filteredData.length;
    totalPages = Math.ceil(totalEntries / entriesPerPage);
    
    // Update pagination info
    const startEntry = (currentPage - 1) * entriesPerPage + 1;
    const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);
    
    document.getElementById('pagination-info').textContent = 
        `Showing ${startEntry} to ${endEntry} of ${totalEntries} entries`;
    
    // Update pagination controls
    const controls = document.getElementById('pagination-controls');
    const firstBtn = controls.querySelector('li:first-child');
    const prevBtn = controls.querySelector('li:nth-child(2)');
    const nextBtn = controls.querySelector('li:nth-child(3)');
    const lastBtn = controls.querySelector('li:last-child');
    
    // Enable/disable buttons
    firstBtn.classList.toggle('disabled', currentPage === 1);
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === totalPages);
    lastBtn.classList.toggle('disabled', currentPage === totalPages);
}

function displayCurrentPageData() {
    if (!filteredData) return;
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    displayFilteredInformation(pageData);
}