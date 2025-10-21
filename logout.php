<?php
require_once 'includes/session.php';

// Destroy session and redirect to login
destroyUserSession();
header("Location: login.php");
exit();
?>

