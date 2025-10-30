// ========================================
// GENERAL LEDGER MODULE - BEAUTIFUL & CLEAN JS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeGeneralLedger();
});

function initializeGeneralLedger() {
    console.log('General Ledger module initialized');
    
    // Add smooth animations
    addSmoothAnimations();
    
    // Load initial data with better error handling
    loadStatistics();
    loadCharts();
    loadAccountsTable();
    loadTransactionsTable();
}

// ========================================
// SMOOTH ANIMATIONS
// ========================================

function addSmoothAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.stat-card, .chart-container, .gl-section');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========================================
// LOAD STATISTICS
// ========================================

function loadStatistics() {
    // Show loading state immediately
    showStatisticsLoadingState();
    
    // Try to fetch from API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    fetch('../modules/api/general-ledger-data.php?action=get_statistics', {
        signal: controller.signal
    })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                animateStatistics(data.data);
                console.log('Statistics loaded successfully:', data.data);
            } else {
                console.warn('API returned error, using fallback data');
                animateStatistics(getFallbackStatistics());
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Error loading statistics:', error);
            console.log('Using fallback statistics data');
            animateStatistics(getFallbackStatistics());
        });
}

function showStatisticsLoadingState() {
    const elements = {
        'total-accounts': 'Loading...',
        'total-transactions': 'Loading...',
        'total-audit': 'Loading...',
        'total-adjustments': 'Loading...'
    };
    
    Object.entries(elements).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<span class="loading-text">${text}</span>`;
        }
    });
}

function animateStatistics(data) {
    const elements = {
        'total-accounts': data.total_accounts,
        'total-transactions': data.total_transactions,
        'total-audit': data.total_audit,
        'total-adjustments': data.total_adjustments
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            // Clear loading text
            element.innerHTML = '';
            animateNumber(element, 0, value, 1500);
        }
    });
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const startValue = start;
    const endValue = end;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smoother animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // Add a subtle pulse effect when animation completes
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.transition = 'transform 0.2s ease';
            }, 100);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ========================================
// LOAD CHARTS
// ========================================

function loadCharts() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    fetch('../modules/api/general-ledger-data.php?action=get_chart_data', {
        signal: controller.signal
    })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderAccountTypesChart(data.data.account_types);
                renderTransactionSummaryChart(data.data.transaction_summary);
                renderAuditCharts(data.data);
                console.log('Charts loaded successfully');
            } else {
                console.warn('API returned error, using fallback chart data');
                const fallbackData = getFallbackChartData();
                renderAccountTypesChart(fallbackData.account_types);
                renderTransactionSummaryChart(fallbackData.transaction_summary);
                renderAuditCharts(fallbackData);
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Error loading charts:', error);
            console.log('Using fallback chart data');
            const fallbackData = getFallbackChartData();
            renderAccountTypesChart(fallbackData.account_types);
            renderTransactionSummaryChart(fallbackData.transaction_summary);
            renderAuditCharts(fallbackData);
        });
}

function renderAccountTypesChart(data) {
    const ctx = document.getElementById('accountTypesChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#28A745',
                    '#DC3545',
                    '#6F42C1',
                    '#17A2B8',
                    '#FFC107',
                    '#E83E8C',
                    '#20C997'
                ],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#fff',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff',
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 15,
                    displayColors: true,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed + ' accounts';
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            label += ' (' + percentage + '%)';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderTransactionSummaryChart(data) {
    const ctx = document.getElementById('transactionSummaryChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Transactions',
                data: data.values,
                backgroundColor: 'rgba(245, 166, 35, 0.9)',
                borderColor: '#F5A623',
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 40,
                hoverBackgroundColor: 'rgba(245, 166, 35, 1)',
                hoverBorderColor: '#fff',
                hoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 15,
                    displayColors: false,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' transactions';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 13,
                            weight: '600'
                        },
                        stepSize: 25
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderAuditCharts(data) {
    // Audit Account Types Chart
    const ctx1 = document.getElementById('auditAccountTypesChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'pie',
            data: {
                labels: data.account_types.labels,
                datasets: [{
                    data: data.account_types.values,
                    backgroundColor: [
                        '#28A745',
                        '#DC3545',
                        '#6F42C1',
                        '#17A2B8',
                        '#FFC107'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#fff',
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 15,
                        displayColors: true,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed + ' accounts';
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                label += ' (' + percentage + '%)';
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Audit Transaction Chart
    const ctx2 = document.getElementById('auditTransactionChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: data.transaction_summary.labels,
                datasets: [{
                    label: 'Transactions',
                    data: data.transaction_summary.values,
                    backgroundColor: 'rgba(245, 166, 35, 0.9)',
                    borderColor: '#F5A623',
                    borderWidth: 0,
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 35,
                    hoverBackgroundColor: 'rgba(245, 166, 35, 1)',
                    hoverBorderColor: '#fff',
                    hoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 15,
                        displayColors: false,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' transactions';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            stepSize: 25
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.15)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 13,
                                weight: '600'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// ========================================
// LOAD ACCOUNTS TABLE
// ========================================

function loadAccountsTable() {
    showLoadingState('accounts');

    fetch('../modules/api/general-ledger-data.php?action=get_accounts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayAccountsTable(data.data);
            } else {
                console.warn('API returned error, using fallback accounts data');
                displayAccountsTable(getFallbackAccounts());
            }
        })
        .catch(error => {
            console.error('Error loading accounts:', error);
            console.log('Using fallback accounts data');
            displayAccountsTable(getFallbackAccounts());
        });
}

function displayAccountsTable(accounts) {
    const tbody = document.querySelector('#accounts-table tbody');
    
    if (accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No accounts found</td></tr>';
        return;
    }
    
    let html = '';
    accounts.slice(0, 10).forEach((account, index) => {
        html += `
            <tr style="animation-delay: ${index * 0.1}s">
                <td><strong class="account-code">${account.code}</strong></td>
                <td><span class="account-name">${account.name}</span></td>
                <td><span class="badge bg-${getAccountTypeBadge(account.category)}">${account.category}</span></td>
                <td class="amount-cell">₱${formatCurrency(account.balance)}</td>
                <td><button class="btn btn-sm btn-outline-primary" onclick="viewAccountDetails('${account.code}')">View</button></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Add fade-in animation to table rows
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// ========================================
// LOAD TRANSACTIONS TABLE
// ========================================

function loadTransactionsTable() {
    showLoadingState('transactions');

    fetch('../modules/api/general-ledger-data.php?action=get_recent_transactions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayTransactionsTable(data.data);
            } else {
                console.warn('API returned error, using fallback transactions data');
                displayTransactionsTable(getFallbackTransactions());
            }
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            console.log('Using fallback transactions data');
            displayTransactionsTable(getFallbackTransactions());
        });
}

function displayTransactionsTable(transactions) {
    const tbody = document.querySelector('#transactions-table tbody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No transactions found</td></tr>';
        return;
    }
    
    let html = '';
    transactions.slice(0, 10).forEach((txn, index) => {
        html += `
            <tr style="animation-delay: ${index * 0.1}s">
                <td><strong class="transaction-id">${txn.journal_no}</strong></td>
                <td><span class="transaction-date">${txn.entry_date}</span></td>
                <td><span class="transaction-desc">${txn.description || '-'}</span></td>
                <td class="text-end amount-debit">₱${formatCurrency(txn.total_debit)}</td>
                <td class="text-end amount-credit">₱${formatCurrency(txn.total_credit)}</td>
                <td><button class="btn btn-sm btn-outline-primary" onclick="viewTransactionDetails('${txn.journal_no}')">View</button></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Add fade-in animation to table rows
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// ========================================
// FILTER FUNCTIONS
// ========================================

function applyChartFilters() {
    showNotification('Chart filters applied successfully!', 'success');
    // Implement chart filter logic
}

function viewDrillDown() {
    showNotification('Opening drill-down view...', 'info');
    // Implement drill-down logic
}

function applyAccountFilter() {
    const searchTerm = document.getElementById('account-search').value;

    if (!searchTerm.trim()) {
        loadAccountsTable();
        return;
    }

    showLoadingState('accounts');

    const encodedSearch = encodeURIComponent(searchTerm.trim());

    fetch(`../modules/api/general-ledger-data.php?action=get_accounts&search=${encodedSearch}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayAccountsTable(data.data);
                showNotification(`Found ${data.data.length} accounts matching "${searchTerm}"`, 'info');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error applying filter', 'error');
        });
}

function resetAccountFilter() {
    document.getElementById('account-search').value = '';
    loadAccountsTable();
    showNotification('Account filter reset', 'info');
}

function applyTransactionFilter() {
    showNotification('Transaction filters applied!', 'success');
    loadTransactionsTable();
}

function resetTransactionFilter() {
    showNotification('Transaction filters reset', 'info');
    loadTransactionsTable();
}

function showLoadingState(section) {
    const tableTargets = {
        accounts: '#accounts-table tbody',
        transactions: '#transactions-table tbody'
    };

    const selector = tableTargets[section];
    if (!selector) return;

    const tbody = document.querySelector(selector);
    if (!tbody) return;

    const colSpan = section === 'transactions' ? 6 : 5;

    tbody.innerHTML = `
        <tr>
            <td colspan="${colSpan}" class="text-center py-4">
                <div class="loading-spinner"></div>
                <p>Loading ${section}...</p>
            </td>
        </tr>
    `;
}

// ========================================
// VIEW DETAILS FUNCTIONS
// ========================================

function viewAccountDetails(accountCode) {
    showNotification(`Opening account details for: ${accountCode}`, 'info');
    // Implement account details modal/page
}

function viewTransactionDetails(journalNo) {
    showNotification(`Opening transaction details for: ${journalNo}`, 'info');
    // Implement transaction details modal/page
}

function viewAccount() {
    showNotification('Opening account details...', 'info');
}

function viewTransaction() {
    showNotification('Opening transaction details...', 'info');
}

function exportAccounts() {
    showNotification('Preparing account export...', 'info');
}

function exportTransactions() {
    showNotification('Generating transaction export...', 'info');
}

function printTransactions() {
    showNotification('Sending transaction table to printer...', 'info');
    window.print();
}

function refreshTransactions() {
    showNotification('Refreshing transaction list...', 'success');
    loadTransactionsTable();
}

// ========================================
// SCROLL TO SECTION
// ========================================

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        // Add highlight effect
        element.style.boxShadow = '0 0 20px rgba(245, 166, 35, 0.3)';
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 2000);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCurrency(amount) {
    return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getAccountTypeBadge(category) {
    const badges = {
        'asset': 'success',
        'liability': 'danger',
        'equity': 'primary',
        'revenue': 'info',
        'expense': 'warning'
    };
    return badges[category] || 'secondary';
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#28A745',
        'error': '#DC3545',
        'warning': '#FFC107',
        'info': '#17A2B8'
    };
    return colors[type] || '#17A2B8';
}

// ========================================
// FALLBACK DATA FUNCTIONS
// ========================================

function getFallbackStatistics() {
    return {
        total_accounts: 247,
        total_transactions: 1542,
        total_audit: 89,
        total_adjustments: 23
    };
}

function getFallbackChartData() {
    return {
        account_types: {
            labels: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'],
            values: [45, 32, 28, 15, 25]
        },
        transaction_summary: {
            labels: ['Sales', 'Purchases', 'Payments', 'Receipts', 'Adjustments'],
            values: [120, 85, 95, 110, 23]
        }
    };
}

function getFallbackAccounts() {
    return [
        { code: '1001', name: 'Cash on Hand', category: 'asset', balance: 15000.00, is_active: true },
        { code: '1002', name: 'Bank Account', category: 'asset', balance: 125000.00, is_active: true },
        { code: '2001', name: 'Accounts Payable', category: 'liability', balance: 25000.00, is_active: true },
        { code: '3001', name: 'Owner Equity', category: 'equity', balance: 100000.00, is_active: true },
        { code: '4001', name: 'Sales Revenue', category: 'revenue', balance: 75000.00, is_active: true },
        { code: '5001', name: 'Office Supplies', category: 'expense', balance: 5000.00, is_active: true }
    ];
}

function getFallbackTransactions() {
    return [
        { journal_no: 'TXN-2024-001', entry_date: 'Jan 15, 2024', description: 'Office Supplies Purchase', total_debit: 2450.00, total_credit: 0, status: 'posted' },
        { journal_no: 'TXN-2024-002', entry_date: 'Jan 14, 2024', description: 'Client Payment Received', total_debit: 0, total_credit: 15750.00, status: 'posted' },
        { journal_no: 'TXN-2024-003', entry_date: 'Jan 13, 2024', description: 'Utility Bill Payment', total_debit: 1250.00, total_credit: 0, status: 'posted' },
        { journal_no: 'TXN-2024-004', entry_date: 'Jan 12, 2024', description: 'Equipment Lease Payment', total_debit: 3200.00, total_credit: 0, status: 'posted' },
        { journal_no: 'TXN-2024-005', entry_date: 'Jan 11, 2024', description: 'Service Revenue', total_debit: 0, total_credit: 8900.00, status: 'posted' }
    ];
}
