<?php
/**
 * Load Sample HRIS Data
 * This script loads sample data into the database for testing the Payroll Management module
 */

require_once 'config/database.php';

echo "<h2>Loading Sample HRIS Data</h2>";
echo "<hr>";

// Read the sample data SQL file
$sql_file = 'database/sample_hris_data.sql';
if (!file_exists($sql_file)) {
    die("❌ <strong>ERROR:</strong> Sample data file not found: $sql_file");
}

$sql_content = file_get_contents($sql_file);
if (!$sql_content) {
    die("❌ <strong>ERROR:</strong> Could not read sample data file");
}

// Split SQL into individual statements
$statements = array_filter(array_map('trim', explode(';', $sql_content)));

$success_count = 0;
$error_count = 0;

echo "<h3>Executing SQL Statements...</h3>";

foreach ($statements as $statement) {
    if (empty($statement) || strpos($statement, '--') === 0) {
        continue; // Skip empty statements and comments
    }
    
    try {
        if ($conn->query($statement)) {
            $success_count++;
            echo "✅ Statement executed successfully<br>";
        } else {
            $error_count++;
            echo "❌ Error executing statement: " . $conn->error . "<br>";
        }
    } catch (Exception $e) {
        $error_count++;
        echo "❌ Exception: " . $e->getMessage() . "<br>";
    }
}

echo "<hr>";
echo "<h3>Summary</h3>";
echo "✅ <strong>Successful statements:</strong> $success_count<br>";
echo "❌ <strong>Failed statements:</strong> $error_count<br>";

if ($error_count == 0) {
    echo "<br><div style='background: #d4edda; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;'>";
    echo "🎉 <strong>SUCCESS!</strong> Sample data loaded successfully.<br>";
    echo "You can now test the Payroll Management module with real data.";
    echo "</div>";
    
    echo "<br><p><a href='modules/payroll-management.php' style='background: #0A3D3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>→ Go to Payroll Management</a></p>";
} else {
    echo "<br><div style='background: #f8d7da; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;'>";
    echo "⚠️ <strong>WARNING:</strong> Some statements failed. Check the errors above.";
    echo "</div>";
}

echo "<hr>";
echo "<h3>What was loaded:</h3>";
echo "<ul>";
echo "<li>10 Employee records</li>";
echo "<li>3 Bank accounts</li>";
echo "<li>21 Salary components (earnings, deductions, taxes, employer contributions)</li>";
echo "<li>7 Expense categories</li>";
echo "<li>10 Expense claims</li>";
echo "<li>10 Payment transactions</li>";
echo "<li>4 Loan types</li>";
echo "<li>8 Loan records</li>";
echo "<li>10 Loan payments</li>";
echo "<li>3 Payroll periods</li>";
echo "<li>3 Payroll runs</li>";
echo "<li>9 Payslips</li>";
echo "</ul>";

$conn->close();
?>
