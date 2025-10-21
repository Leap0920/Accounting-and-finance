<?php
require_once '../config/database.php';
require_once '../includes/session.php';

requireLogin();
$current_user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Reading - Accounting and Finance System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <header class="main-header">
        <div class="header-left">
            <div class="logo-circle">E</div>
            <div class="logo-text">
                <h1>EVERGREEN</h1>
                <p>Secure. Invest. Achieve</p>
            </div>
        </div>
        <nav class="main-nav">
            <a href="../core/dashboard.php" class="nav-link">HOME</a>
            <a href="../core/dashboard.php" class="nav-link">DASHBOARD</a>
            <a href="#" class="nav-link active">MODULES</a>
        </nav>
        <div class="header-right">
            <span class="user-name">Welcome, <?php echo htmlspecialchars($current_user['full_name']); ?></span>
            <a href="../core/logout.php" class="btn-logout">Logout</a>
        </div>
    </header>
    
    <div class="page-title">
        <h2>TRANSACTION READING</h2>
    </div>
    
    <main class="dashboard-main">
        <div class="module-content">
            <div class="content-box">
                <h3>Transaction Reading Module</h3>
                <p>Record and track all financial transactions.</p>
                <p style="margin-top: 20px; color: #666;">This module is under development.</p>
                <a href="../core/dashboard.php" class="btn-back">Back to Dashboard</a>
            </div>
        </div>
    </main>
    
    <footer class="main-footer">
        <p>&copy; <?php echo date('Y'); ?> Evergreen Accounting & Finance. All rights reserved.</p>
    </footer>
</body>
</html>

