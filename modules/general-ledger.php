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
    <title>General Ledger - Accounting and Finance System</title>
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
            <a href="../dashboard.php" class="nav-link">HOME</a>
            <a href="../dashboard.php" class="nav-link">DASHBOARD</a>
            <a href="#" class="nav-link active">MODULES</a>
        </nav>
        
        <div class="header-right">
            <span class="user-name">Welcome, <?php echo htmlspecialchars($current_user['full_name']); ?></span>
            <a href="../logout.php" class="btn-logout">Logout</a>
        </div>
    </header>
    
    <!-- Page Title -->
    <div class="page-title">
        <h2>GENERAL LEDGER</h2>
    </div>
    
    <!-- Main Content -->
    <main class="dashboard-main">
        <div class="module-content">
            <div class="content-box">
                <h3>General Ledger Module</h3>
                <p>Manage your chart of accounts and financial records.</p>
                <p style="margin-top: 20px; color: #666;">This module is under development.</p>
                <a href="../dashboard.php" class="btn-back">Back to Dashboard</a>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="main-footer">
        <p>&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
    </footer>
</body>
</html>

