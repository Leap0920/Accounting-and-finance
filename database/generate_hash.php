<?php
// generate_hash.php
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Password: $password<br>";
echo "Hash: $hash<br>";
echo "<br>Copy the hash and use it in the SQL below.";
?>