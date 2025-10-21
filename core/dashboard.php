<?php
require_once '../config/database.php';
require_once '../includes/session.php';

// Require login to access this page
requireLogin();

$current_user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Accounting and Finance System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <!-- Header -->
    <header class="main-header">
        <div class="header-left">
            <div class="logo-circle">E</div>
            <div class="logo-text">
                <h1>EVERGREEN</h1>
                <p>Secure. Invest. Achieve</p>
            </div>
        </div>
        
        <nav class="main-nav">
            <a href="dashboard.php" class="nav-link active">HOME</a>
            <a href="dashboard.php" class="nav-link">DASHBOARD</a>
            <a href="#" class="nav-link">MODULES</a>
        </nav>
        
        <div class="header-right">
            <span class="user-name">Welcome, <?php echo htmlspecialchars($current_user['full_name']); ?></span>
            <a href="logout.php" class="btn-logout">Logout</a>
        </div>
    </header>
    
    <!-- Page Title -->
    <div class="page-title">
        <h2>ACCOUNTING AND FINANCE</h2>
    </div>
    
    <!-- Main Content -->
    <main class="dashboard-main">
        <div class="modules-container">
            <!-- General Ledger Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <rect x="15" y="10" width="30" height="40" rx="2" fill="#0A3D3D" stroke="#FFF" stroke-width="2"/>
                        <line x1="20" y1="20" x2="40" y2="20" stroke="#FFF" stroke-width="2"/>
                        <line x1="20" y1="28" x2="40" y2="28" stroke="#FFF" stroke-width="2"/>
                        <line x1="20" y1="36" x2="40" y2="36" stroke="#FFF" stroke-width="2"/>
                    </svg>
                </div>
                <h3>General Ledger</h3>
                <p>Manage your accounts and financial records</p>
                <a href="../modules/general-ledger.php" class="module-link">Access Module</a>
            </div>
            
            <!-- Financial Reporting Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <rect x="15" y="35" width="8" height="15" fill="#0A3D3D"/>
                        <rect x="26" y="25" width="8" height="25" fill="#0A3D3D"/>
                        <rect x="37" y="15" width="8" height="35" fill="#0A3D3D"/>
                        <polyline points="19,35 30,25 41,15" stroke="#C17817" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <h3>Financial Reporting</h3>
                <p>Generate and view financial reports</p>
                <a href="../modules/financial-reporting.php" class="module-link">Access Module</a>
            </div>
            
            <!-- Loan Accounting Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <rect x="12" y="20" width="36" height="25" rx="2" fill="#0A3D3D" stroke="#FFF" stroke-width="2"/>
                        <rect x="12" y="18" width="36" height="4" fill="#0A3D3D"/>
                        <circle cx="30" cy="32" r="6" fill="#FFF"/>
                        <text x="30" y="36" text-anchor="middle" fill="#0A3D3D" font-size="10" font-weight="bold">$</text>
                    </svg>
                </div>
                <h3>Loan Accounting</h3>
                <p>Track loans and manage lending</p>
                <a href="../modules/loan-accounting.php" class="module-link">Access Module</a>
            </div>
            
            <!-- Transaction Reading Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <path d="M40 25 L50 30 L40 35" fill="#0A3D3D" stroke="#FFF" stroke-width="2"/>
                        <path d="M20 35 L10 30 L20 25" fill="#0A3D3D" stroke="#FFF" stroke-width="2"/>
                        <line x1="48" y1="30" x2="12" y2="30" stroke="#0A3D3D" stroke-width="3"/>
                    </svg>
                </div>
                <h3>Transaction Reading</h3>
                <p>Record and track financial transactions</p>
                <a href="../modules/transaction-reading.php" class="module-link">Access Module</a>
            </div>
            
            <!-- Expense Tracking Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <rect x="15" y="15" width="30" height="35" rx="2" fill="#0A3D3D" stroke="#FFF" stroke-width="2"/>
                        <rect x="15" y="15" width="30" height="8" fill="#0A3D3D"/>
                        <line x1="20" y1="30" x2="40" y2="30" stroke="#FFF" stroke-width="2"/>
                        <line x1="20" y1="37" x2="35" y2="37" stroke="#FFF" stroke-width="2"/>
                        <line x1="20" y1="44" x2="32" y2="44" stroke="#FFF" stroke-width="2"/>
                    </svg>
                </div>
                <h3>Expense Tracking</h3>
                <p>Monitor and manage expenses</p>
                <a href="../modules/expense-tracking.php" class="module-link">Access Module</a>
            </div>
            
            <!-- Payroll Management Module -->
            <div class="module-card">
                <div class="module-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <circle cx="30" cy="22" r="7" fill="#0A3D3D"/>
                        <circle cx="20" cy="22" r="5" fill="#0A3D3D" opacity="0.7"/>
                        <circle cx="40" cy="22" r="5" fill="#0A3D3D" opacity="0.7"/>
                        <path d="M15 45 Q15 35 20 35 Q25 35 25 35 Q30 35 30 35 Q35 35 35 35 Q40 35 40 35 Q45 35 45 45 Z" fill="#0A3D3D"/>
                    </svg>
                </div>
                <h3>Payroll Management</h3>
                <p>Handle employee payroll and compensation</p>
                <a href="../modules/payroll-management.php" class="module-link">Access Module</a>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="main-footer">
        <p>&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
    </footer>
</body>
</html>

