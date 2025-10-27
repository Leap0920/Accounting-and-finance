// ========================================
// EXPENSE TRACKING MODULE JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeExpenseTracking();
});

function initializeExpenseTracking() {
    // Initialize filter toggle
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.style.display = 'none';
    }
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize tooltips for action buttons
    initializeTooltips();
    
    // Add loading states for buttons
    initializeLoadingStates();
}

// Toggle filter form visibility
function toggleFilters() {
    const filterForm = document.getElementById('filterForm');
    const toggleBtn = document.querySelector('.btn-toggle-filters i');
    
    if (filterForm.style.display === 'none' || filterForm.style.display === '') {
        filterForm.style.display = 'block';
        filterForm.classList.add('show');
        toggleBtn.classList.remove('fa-chevron-down');
        toggleBtn.classList.add('fa-chevron-up');
    } else {
        filterForm.style.display = 'none';
        filterForm.classList.remove('show');
        toggleBtn.classList.remove('fa-chevron-up');
        toggleBtn.classList.add('fa-chevron-down');
    }
}

// View expense details
function viewExpense(expenseId) {
    showLoading('Loading expense details...');
    
    fetch(`../modules/api/expense-data.php?action=get_expense_details&expense_id=${expenseId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                displayExpenseModal(data.data);
            } else {
                showNotification(data.error || 'Failed to load expense details', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load expense details', 'error');
        });
}

// Display expense details in modal
function displayExpenseModal(expense) {
    const modalBody = document.getElementById('expenseModalBody');
    
    modalBody.innerHTML = `
        <div class="expense-details">
            <div class="detail-grid">
                <div class="detail-group">
                    <label>Transaction Number:</label>
                    <span class="detail-value">${expense.claim_no}</span>
                </div>
                <div class="detail-group">
                    <label>Employee:</label>
                    <span class="detail-value">${expense.employee_name}</span>
                </div>
                <div class="detail-group">
                    <label>Expense Date:</label>
                    <span class="detail-value">${formatDate(expense.expense_date)}</span>
                </div>
                <div class="detail-group">
                    <label>Amount:</label>
                    <span class="detail-value amount">₱${formatCurrency(expense.amount)}</span>
                </div>
                <div class="detail-group">
                    <label>Category:</label>
                    <span class="detail-value">${expense.category}</span>
                </div>
                <div class="detail-group">
                    <label>Account:</label>
                    <span class="detail-value">${expense.account_code} - ${expense.account_name}</span>
                </div>
                <div class="detail-group">
                    <label>Status:</label>
                    <span class="status-badge status-${expense.status}">${capitalizeFirst(expense.status)}</span>
                </div>
                <div class="detail-group">
                    <label>Description:</label>
                    <span class="detail-value">${expense.description}</span>
                </div>
                <div class="detail-group">
                    <label>Created By:</label>
                    <span class="detail-value">${expense.created_by}</span>
                </div>
                <div class="detail-group">
                    <label>Created At:</label>
                    <span class="detail-value">${formatDateTime(expense.created_at)}</span>
                </div>
                ${expense.approved_by ? `
                <div class="detail-group">
                    <label>Approved By:</label>
                    <span class="detail-value">${expense.approved_by}</span>
                </div>
                <div class="detail-group">
                    <label>Approved At:</label>
                    <span class="detail-value">${formatDateTime(expense.approved_at)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    showModal('expenseModal');
}

// View audit trail
function viewAuditTrail(expenseId) {
    showLoading('Loading audit trail...');
    
    fetch(`../modules/api/expense-data.php?action=get_audit_trail&expense_id=${expenseId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                displayAuditModal(data.data);
            } else {
                showNotification(data.error || 'Failed to load audit trail', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load audit trail', 'error');
        });
}

// Display audit trail in modal
function displayAuditModal(auditData) {
    const modalBody = document.getElementById('auditModalBody');
    
    let auditHtml = '<div class="audit-trail">';
    auditHtml += '<div class="audit-header"><h4>Audit Trail History</h4></div>';
    auditHtml += '<div class="audit-timeline">';
    
    auditData.forEach((entry, index) => {
        auditHtml += `
            <div class="audit-entry ${index === 0 ? 'latest' : ''}">
                <div class="audit-icon">
                    <i class="fas fa-${getAuditIcon(entry.action)}"></i>
                </div>
                <div class="audit-content">
                    <div class="audit-action">${entry.action}</div>
                    <div class="audit-details">
                        <span class="audit-user">${entry.user}</span>
                        <span class="audit-time">${formatDateTime(entry.timestamp)}</span>
                    </div>
                    <div class="audit-changes">${entry.changes}</div>
                    <div class="audit-meta">
                        <small>IP: ${entry.ip_address}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    auditHtml += '</div></div>';
    modalBody.innerHTML = auditHtml;
    
    showModal('auditModal');
}

// Show general audit trail
function showAuditTrail() {
    showLoading('Loading audit trail...');
    
    fetch(`../modules/api/expense-data.php?action=get_audit_trail&general=true`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                displayAuditModal(data.data);
            } else {
                showNotification(data.error || 'Failed to load audit trail', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load audit trail', 'error');
        });
}

// Export to Excel
function exportToExcel() {
    showLoading('Preparing Excel export...');
    
    // Get current filter parameters
    const urlParams = new URLSearchParams(window.location.search);
    const exportUrl = `../modules/api/expense-data.php?action=export_expenses&${urlParams.toString()}`;
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideLoading();
    showNotification('Export completed successfully!', 'success');
}

// Print report
function printReport() {
    // Hide elements that shouldn't be printed
    const elementsToHide = document.querySelectorAll('.filter-section, .results-actions, .action-buttons');
    elementsToHide.forEach(el => el.style.display = 'none');
    
    // Print
    window.print();
    
    // Restore elements
    elementsToHide.forEach(el => el.style.display = '');
    
    showNotification('Print dialog opened', 'info');
}

// Utility functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

function showLoading(message = 'Loading...') {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.title;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initializeLoadingStates() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('btn-primary') || this.classList.contains('btn-secondary')) {
                this.style.opacity = '0.7';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 1000);
            }
        });
    });
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAuditIcon(action) {
    const icons = {
        'Created': 'plus',
        'Updated': 'edit',
        'Approved': 'check',
        'Rejected': 'times',
        'Deleted': 'trash',
        'Login': 'sign-in-alt',
        'Logout': 'sign-out-alt',
        'Filter Applied': 'filter',
        'Export': 'download',
        'Print': 'print'
    };
    return icons[action] || 'info';
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

function tableToCSV(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => {
            // Remove HTML tags and clean text
            let text = cell.textContent.trim();
            // Escape commas and quotes
            text = text.replace(/"/g, '""');
            return `"${text}"`;
        }).join(',');
    }).join('\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading-content {
        text-align: center;
        color: white;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-text {
        font-size: 1.1rem;
        font-weight: 500;
    }
    
    .expense-details {
        padding: 1rem 0;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .detail-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .detail-group label {
        font-weight: 600;
        color: #0A3D3D;
        font-size: 0.9rem;
    }
    
    .detail-value {
        color: #495057;
        font-size: 1rem;
    }
    
    .audit-trail {
        padding: 1rem 0;
    }
    
    .audit-header h4 {
        color: #0A3D3D;
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
    }
    
    .audit-timeline {
        position: relative;
        padding-left: 2rem;
    }
    
    .audit-timeline::before {
        content: '';
        position: absolute;
        left: 1rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #E8E8E8;
    }
    
    .audit-entry {
        position: relative;
        margin-bottom: 2rem;
        padding-left: 2rem;
    }
    
    .audit-entry.latest .audit-icon {
        background: #C17817;
        color: white;
    }
    
    .audit-icon {
        position: absolute;
        left: -1.5rem;
        top: 0.5rem;
        width: 2rem;
        height: 2rem;
        background: #E8E8E8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: #6C757D;
    }
    
    .audit-content {
        background: #F8F9FA;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #C17817;
    }
    
    .audit-action {
        font-weight: 600;
        color: #0A3D3D;
        margin-bottom: 0.5rem;
    }
    
    .audit-details {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #6C757D;
    }
    
    .audit-changes {
        color: #495057;
        margin-bottom: 0.5rem;
    }
    
    .audit-meta {
        font-size: 0.8rem;
        color: #6C757D;
    }
`;
document.head.appendChild(style);
