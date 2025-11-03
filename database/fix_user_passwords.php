<?php
/**
 * User Password Fixer
 * Automatically fixes password hashes for all users in the database
 * This should be run after importing sample data to ensure passwords work correctly
 * 
 * Usage: Access via browser or run from command line: php database/fix_user_passwords.php
 */

require_once __DIR__ . '/../config/database.php';

// Default passwords to set (you can modify these)
$default_passwords = [
    'admin' => 'admin123',
    // Add more default users here if needed
];

echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Fix User Passwords</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; padding: 10px; background: #f0fff0; border: 1px solid green; margin: 10px 0; }
        .error { color: red; padding: 10px; background: #fff0f0; border: 1px solid red; margin: 10px 0; }
        .info { color: blue; padding: 10px; background: #f0f0ff; border: 1px solid blue; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>User Password Fixer</h1>
    <hr>";

try {
    $conn = getDBConnection();
    
    // Get all users from database
    $result = $conn->query("SELECT id, username, email, full_name FROM users ORDER BY username");
    
    if (!$result) {
        throw new Exception("Error querying users: " . $conn->error);
    }
    
    $users_fixed = 0;
    $users_skipped = 0;
    $errors = [];
    
    echo "<h2>Processing Users...</h2>";
    echo "<table>";
    echo "<tr><th>Username</th><th>Email</th><th>Full Name</th><th>Status</th></tr>";
    
    while ($user = $result->fetch_assoc()) {
        $username = $user['username'];
        $new_password = null;
        
        // Check if this user has a default password defined
        if (isset($default_passwords[$username])) {
            $new_password = $default_passwords[$username];
        } else {
            // For users not in the default list, use username as password (or skip)
            // You can modify this behavior
            $users_skipped++;
            echo "<tr>";
            echo "<td>{$username}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td>{$user['full_name']}</td>";
            echo "<td><span style='color: orange;'>Skipped (no default password)</span></td>";
            echo "</tr>";
            continue;
        }
        
        // Generate new password hash
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Update user password
        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $password_hash, $user['id']);
        
        if ($stmt->execute()) {
            $users_fixed++;
            echo "<tr>";
            echo "<td>{$username}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td>{$user['full_name']}</td>";
            echo "<td><span style='color: green;'>✅ Fixed (password: {$new_password})</span></td>";
            echo "</tr>";
        } else {
            $errors[] = "Failed to update password for {$username}: " . $conn->error;
            echo "<tr>";
            echo "<td>{$username}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td>{$user['full_name']}</td>";
            echo "<td><span style='color: red;'>❌ Error</span></td>";
            echo "</tr>";
        }
        
        $stmt->close();
    }
    
    echo "</table>";
    
    echo "<hr>";
    echo "<div class='info'>";
    echo "<h3>Summary</h3>";
    echo "<p><strong>Users Fixed:</strong> {$users_fixed}</p>";
    echo "<p><strong>Users Skipped:</strong> {$users_skipped}</p>";
    echo "<p><strong>Errors:</strong> " . count($errors) . "</p>";
    echo "</div>";
    
    if (!empty($errors)) {
        echo "<div class='error'>";
        echo "<h3>Errors:</h3>";
        echo "<ul>";
        foreach ($errors as $error) {
            echo "<li>{$error}</li>";
        }
        echo "</ul>";
        echo "</div>";
    }
    
    if ($users_fixed > 0) {
        echo "<div class='success'>";
        echo "<h3>✅ Password Fix Complete!</h3>";
        echo "<p>You can now log in with the following credentials:</p>";
        echo "<ul>";
        foreach ($default_passwords as $username => $password) {
            echo "<li><strong>Username:</strong> {$username} | <strong>Password:</strong> {$password}</li>";
        }
        echo "</ul>";
        echo "<p><a href='../core/login.php' style='display: inline-block; padding: 10px 20px; background: #0A3D3D; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;'>Go to Login Page</a></p>";
        echo "</div>";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Error</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<p style='color: #666; font-size: 12px;'>";
echo "⚠️ <strong>Note:</strong> This script fixes passwords for users in the database. ";
echo "Run this after importing sample data to ensure all passwords work correctly.";
echo "</p>";
echo "</body></html>";
?>

