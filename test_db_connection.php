<?php
/**
 * Database Connection Test
 * Quick test to verify database connection is working
 */

require_once 'config/database.php';

echo "<h2>Database Connection Test</h2>";
echo "<hr>";

// Test 1: Check if $conn exists
if (isset($conn)) {
    echo "✅ <strong>PASS:</strong> \$conn variable exists<br>";
} else {
    echo "❌ <strong>FAIL:</strong> \$conn variable does not exist<br>";
    die();
}

// Test 2: Check connection type
if ($conn instanceof mysqli) {
    echo "✅ <strong>PASS:</strong> \$conn is a valid mysqli object<br>";
} else {
    echo "❌ <strong>FAIL:</strong> \$conn is not a mysqli object<br>";
    die();
}

// Test 3: Test query
try {
    $result = $conn->query("SELECT DATABASE() as db_name");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✅ <strong>PASS:</strong> Connected to database: <strong>" . $row['db_name'] . "</strong><br>";
    } else {
        echo "❌ <strong>FAIL:</strong> Query failed<br>";
    }
} catch (Exception $e) {
    echo "❌ <strong>FAIL:</strong> " . $e->getMessage() . "<br>";
}

// Test 4: Check if tables exist
echo "<br><h3>Available Tables:</h3>";
$result = $conn->query("SHOW TABLES");
if ($result && $result->num_rows > 0) {
    echo "<ul>";
    while ($row = $result->fetch_array()) {
        echo "<li>" . $row[0] . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p>⚠️ <strong>WARNING:</strong> No tables found. You may need to run schema.sql</p>";
}

// Test 5: Check for journal_entries table
$result = $conn->query("SHOW TABLES LIKE 'journal_entries'");
if ($result && $result->num_rows > 0) {
    echo "✅ <strong>PASS:</strong> journal_entries table exists<br>";
    
    // Count transactions
    $count_result = $conn->query("SELECT COUNT(*) as count FROM journal_entries");
    if ($count_result) {
        $count_row = $count_result->fetch_assoc();
        echo "✅ <strong>INFO:</strong> Found <strong>" . $count_row['count'] . "</strong> transactions<br>";
    }
} else {
    echo "❌ <strong>FAIL:</strong> journal_entries table not found. Run schema.sql and sample data SQL.<br>";
}

echo "<hr>";
echo "<h3>Summary</h3>";
echo "<p>If all tests passed, your database connection is working correctly!</p>";
echo "<p><a href='modules/modules/transaction-reading.php'>→ Go to Transaction Recording Module</a></p>";
?>

