<?php
// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

// Function to require login
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit();
    }
}

// Function to get current user data
function getCurrentUser() {
    if (isLoggedIn()) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'],
            'full_name' => $_SESSION['full_name']
        ];
    }
    return null;
}

// Function to set user session
function setUserSession($user_data) {
    $_SESSION['user_id'] = $user_data['id'];
    $_SESSION['username'] = $user_data['username'];
    $_SESSION['email'] = $user_data['email'];
    $_SESSION['full_name'] = $user_data['full_name'];
}

// Function to destroy session
function destroyUserSession() {
    session_unset();
    session_destroy();
}
?>

