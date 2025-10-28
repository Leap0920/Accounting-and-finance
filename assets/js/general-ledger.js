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
    
    // Load initial data
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
    showLoadingState('statistics');
    
    fetch('../modules/api/general-ledger-data.php?action=get_statistics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                animateStatistics(data.data);
            } else {
                showError('Failed to load statistics');
            }
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
            showError('Failed to load statistics');
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
            animateNumber(element, 0, value, 1000);
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
        
        const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function showLoadingState(type) {
    const loadingHtml = `
        <div class="loading-spinner"></div>
        <p class="text-center text-muted">Loading ${type}...</p>
    `;
    
    // Add loading states to relevant containers
    const containers = document.querySelectorAll('.stat-content, .chart-wrapper, .table-container');
    containers.forEach(container => {
        if (container.innerHTML.includes('Loading')) return;
        container.innerHTML = loadingHtml;
    });
}

// ========================================
// LOAD CHARTS
// ========================================

function loadCharts() {
    fetch('../modules/api/general-ledger-data.php?action=get_chart_data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderAccountTypesChart(data.data.account_types);
                renderTransactionSummaryChart(data.data.transaction_summary);
                renderAuditCharts(data.data);
            } else {
                showError('Failed to load chart data');
            }
        })
        .catch(error => {
            console.error('Error loading charts:', error);
            showError('Failed to load chart data');
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
    fetch('../modules/api/general-ledger-data.php?action=get_accounts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayAccountsTable(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading accounts:', error);
            document.querySelector('#accounts-table tbody').innerHTML = '<tr><td colspan="5" class="text-center py-4">Error loading accounts</td></tr>';
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
    fetch('../modules/api/general-ledger-data.php?action=get_recent_transactions')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTransactionsTable(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            document.querySelector('#transactions-table tbody').innerHTML = '<tr><td colspan="6" class="text-center py-4">Error loading transactions</td></tr>';
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
    
    fetch(`../modules/api/general-ledger-data.php?action=get_accounts&search=${searchTerm}`)
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
