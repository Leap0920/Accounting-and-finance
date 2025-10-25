<?php
/**
 * Database Population Script
 * Run this to add sample journal entries to your database
 */

require_once 'config/database.php';

echo "<h2>Database Population Script</h2>";
echo "<p>Adding sample journal entries to test filtering functionality...</p>";

try {
    // Read and execute the sample journal entries SQL
    $sql_file = 'database/sample_journal_entries.sql';
    
    if (!file_exists($sql_file)) {
        throw new Exception("SQL file not found: $sql_file");
    }
    
    $sql_content = file_get_contents($sql_file);
    
    // Split SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql_content)));
    
    $success_count = 0;
    $error_count = 0;
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue; // Skip empty statements and comments
        }
        
        try {
            $conn->query($statement);
            $success_count++;
        } catch (Exception $e) {
            $error_count++;
            echo "<p style='color: red;'>Error executing statement: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    echo "<p style='color: green;'>✅ Successfully executed $success_count statements</p>";
    if ($error_count > 0) {
        echo "<p style='color: orange;'>⚠️ $error_count statements had errors (may be duplicates)</p>";
    }
    
    // Verify data was inserted
    echo "<h3>Verification:</h3>";
    
    $result = $conn->query("SELECT COUNT(*) as count FROM journal_entries");
    $journal_entries = $result->fetch_assoc()['count'];
    echo "<p>Journal Entries: $journal_entries</p>";
    
    $result = $conn->query("SELECT COUNT(*) as count FROM journal_lines");
    $journal_lines = $result->fetch_assoc()['count'];
    echo "<p>Journal Lines: $journal_lines</p>";
    
    $result = $conn->query("SELECT COUNT(*) as count FROM accounts");
    $accounts = $result->fetch_assoc()['count'];
    echo "<p>Accounts: $accounts</p>";
    
    if ($journal_entries > 0 && $journal_lines > 0) {
        echo "<p style='color: green; font-weight: bold;'>✅ Database populated successfully! You can now test the filtering functionality.</p>";
        echo "<p><a href='modules/financial-reporting.php'>Go to Financial Reporting</a></p>";
    } else {
        echo "<p style='color: red; font-weight: bold;'>❌ No data was inserted. Please check the database connection.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

$conn->close();
?>
