<?php
require_once 'config/database.php';

echo "<h2>Testing Loan Accounting Query</h2>";

// Check loan_applications table
echo "<h3>1. Checking loan_applications table</h3>";
$result = $conn->query("SELECT COUNT(*) as count FROM loan_applications");
$row = $result->fetch_assoc();
echo "Total loan applications: " . $row['count'] . "<br>";

if ($row['count'] > 0) {
    echo "<h4>Sample records:</h4>";
    $result2 = $conn->query("SELECT id, full_name, loan_type, loan_amount, status, created_at FROM loan_applications ORDER BY id DESC LIMIT 5");
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Created</th></tr>";
    while ($r = $result2->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $r['id'] . "</td>";
        echo "<td>" . htmlspecialchars($r['full_name']) . "</td>";
        echo "<td>" . htmlspecialchars($r['loan_type']) . "</td>";
        echo "<td>₱" . number_format($r['loan_amount'], 2) . "</td>";
        echo "<td>" . htmlspecialchars($r['status']) . "</td>";
        echo "<td>" . $r['created_at'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Check loans table
echo "<h3>2. Checking loans table</h3>";
$result3 = $conn->query("SELECT COUNT(*) as count FROM loans");
$row3 = $result3->fetch_assoc();
echo "Total loans: " . $row3['count'] . "<br>";

// Test the UNION query
echo "<h3>3. Testing UNION query</h3>";
$unionQuery = "SELECT 
    la.id,
    CONCAT('APP-', la.id) as loan_number,
    la.full_name as borrower_name,
    la.loan_amount,
    la.status,
    'application' as record_type
FROM loan_applications la
ORDER BY la.id DESC
LIMIT 10";

$result4 = $conn->query($unionQuery);
echo "Query results: " . $result4->num_rows . " rows<br>";
if ($result4->num_rows > 0) {
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Loan Number</th><th>Borrower</th><th>Amount</th><th>Status</th><th>Type</th></tr>";
    while ($r = $result4->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $r['id'] . "</td>";
        echo "<td>" . $r['loan_number'] . "</td>";
        echo "<td>" . htmlspecialchars($r['borrower_name']) . "</td>";
        echo "<td>₱" . number_format($r['loan_amount'], 2) . "</td>";
        echo "<td>" . htmlspecialchars($r['status']) . "</td>";
        echo "<td>" . $r['record_type'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

echo "<br><a href='modules/loan-accounting.php'>Go to Loan Accounting</a>";
?>

