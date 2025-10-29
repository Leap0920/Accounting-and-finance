<?php
/**
 * Setup Script for Expense Tracking Module
 * This script will create necessary accounts and add sample expense data
 */

require_once '../config/database.php';

echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Expense Tracking Setup</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0A3D3D;
            border-bottom: 3px solid #C17817;
            padding-bottom: 10px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            border: 1px solid #bee5eb;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #C17817;
        }
        a.btn {
            display: inline-block;
            background: #C17817;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        a.btn:hover {
            background: #A06614;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🚀 Expense Tracking Module Setup</h1>
";

$errors = [];
$success = [];

// Step 1: Check if expense_claims table exists
echo "<div class='step'><strong>Step 1:</strong> Checking if expense_claims table exists...</div>";
$result = $conn->query("SHOW TABLES LIKE 'expense_claims'");
if ($result->num_rows == 0) {
    echo "<div class='error'>❌ Error: expense_claims table does not exist. Please run the main schema.sql first.</div>";
    $errors[] = "expense_claims table missing";
} else {
    echo "<div class='success'>✅ expense_claims table exists</div>";
    $success[] = "expense_claims table found";
}

// Step 2: Check if expense_categories table exists
echo "<div class='step'><strong>Step 2:</strong> Checking if expense_categories table exists...</div>";
$result = $conn->query("SHOW TABLES LIKE 'expense_categories'");
if ($result->num_rows == 0) {
    echo "<div class='error'>❌ Error: expense_categories table does not exist. Please run the main schema.sql first.</div>";
    $errors[] = "expense_categories table missing";
} else {
    echo "<div class='success'>✅ expense_categories table exists</div>";
    $success[] = "expense_categories table found";
}

// Step 3: Check and create expense accounts if needed
echo "<div class='step'><strong>Step 3:</strong> Creating expense accounts...</div>";

// Get or create account type for expenses
$accountTypeQuery = "SELECT id FROM account_types WHERE category = 'expense' LIMIT 1";
$typeResult = $conn->query($accountTypeQuery);

if ($typeResult->num_rows == 0) {
    echo "<div class='error'>❌ Error: No expense account type found. Creating one...</div>";
    
    $createTypeQuery = "INSERT INTO account_types (name, category, description) VALUES 
                       ('Expense Account', 'expense', 'General expense accounts')";
    if ($conn->query($createTypeQuery)) {
        $expenseTypeId = $conn->insert_id;
        echo "<div class='success'>✅ Created expense account type</div>";
    } else {
        echo "<div class='error'>❌ Failed to create account type: " . $conn->error . "</div>";
        $errors[] = "Failed to create account type";
        $expenseTypeId = null;
    }
} else {
    $typeRow = $typeResult->fetch_assoc();
    $expenseTypeId = $typeRow['id'];
    echo "<div class='success'>✅ Expense account type found (ID: $expenseTypeId)</div>";
}

if ($expenseTypeId) {
    // Get default user
    $userResult = $conn->query("SELECT id FROM users LIMIT 1");
    $userId = $userResult->num_rows > 0 ? $userResult->fetch_assoc()['id'] : 1;
    
    $accounts = [
        ['EXP-001', 'Travel Expenses', 'Business travel and transportation costs'],
        ['EXP-002', 'Meals & Entertainment', 'Business meals and client entertainment'],
        ['EXP-003', 'Office Supplies', 'Office supplies and equipment'],
        ['EXP-004', 'Communication Expenses', 'Phone, internet, and communication costs'],
        ['EXP-005', 'Training & Development', 'Employee training and development']
    ];
    
    foreach ($accounts as $account) {
        $checkQuery = "SELECT id FROM accounts WHERE code = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param('s', $account[0]);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows == 0) {
            $insertQuery = "INSERT INTO accounts (code, name, type_id, description, is_active, created_by) 
                           VALUES (?, ?, ?, ?, 1, ?)";
            $insertStmt = $conn->prepare($insertQuery);
            $insertStmt->bind_param('ssisi', $account[0], $account[1], $expenseTypeId, $account[2], $userId);
            
            if ($insertStmt->execute()) {
                echo "<div class='success'>✅ Created account: {$account[0]} - {$account[1]}</div>";
            } else {
                echo "<div class='error'>❌ Failed to create account {$account[0]}: " . $conn->error . "</div>";
            }
        } else {
            echo "<div class='info'>ℹ️ Account {$account[0]} already exists</div>";
        }
    }
}

// Step 4: Create expense categories
echo "<div class='step'><strong>Step 4:</strong> Creating expense categories...</div>";

$categories = [
    ['TRAVEL', 'Travel Expenses', 'EXP-001', 'Business travel and transportation costs'],
    ['MEALS', 'Meals & Entertainment', 'EXP-002', 'Business meals and client entertainment'],
    ['OFFICE', 'Office Supplies', 'EXP-003', 'Office supplies and equipment'],
    ['COMM', 'Communication', 'EXP-004', 'Phone, internet, and communication costs'],
    ['TRAIN', 'Training & Development', 'EXP-005', 'Employee training and development']
];

foreach ($categories as $category) {
    // Get account_id
    $accountQuery = "SELECT id FROM accounts WHERE code = ?";
    $accountStmt = $conn->prepare($accountQuery);
    $accountStmt->bind_param('s', $category[2]);
    $accountStmt->execute();
    $accountResult = $accountStmt->get_result();
    
    if ($accountResult->num_rows > 0) {
        $accountId = $accountResult->fetch_assoc()['id'];
        
        // Check if category exists
        $checkCatQuery = "SELECT id FROM expense_categories WHERE code = ?";
        $checkCatStmt = $conn->prepare($checkCatQuery);
        $checkCatStmt->bind_param('s', $category[0]);
        $checkCatStmt->execute();
        $checkCatResult = $checkCatStmt->get_result();
        
        if ($checkCatResult->num_rows == 0) {
            $insertCatQuery = "INSERT INTO expense_categories (code, name, account_id, description, is_active) 
                              VALUES (?, ?, ?, ?, 1)";
            $insertCatStmt = $conn->prepare($insertCatQuery);
            $insertCatStmt->bind_param('ssis', $category[0], $category[1], $accountId, $category[3]);
            
            if ($insertCatStmt->execute()) {
                echo "<div class='success'>✅ Created category: {$category[0]} - {$category[1]}</div>";
            } else {
                echo "<div class='error'>❌ Failed to create category {$category[0]}: " . $conn->error . "</div>";
            }
        } else {
            echo "<div class='info'>ℹ️ Category {$category[0]} already exists</div>";
        }
    } else {
        echo "<div class='error'>❌ Account {$category[2]} not found for category {$category[0]}</div>";
    }
}

// Step 5: Add sample expense claims (optional)
echo "<div class='step'><strong>Step 5:</strong> Adding sample expense data...</div>";

$checkExpenses = $conn->query("SELECT COUNT(*) as count FROM expense_claims");
$expenseCount = $checkExpenses->fetch_assoc()['count'];

if ($expenseCount == 0) {
    echo "<div class='info'>ℹ️ No expense claims found. Adding sample data...</div>";
    
    $userResult = $conn->query("SELECT id FROM users LIMIT 1");
    $userId = $userResult->num_rows > 0 ? $userResult->fetch_assoc()['id'] : 1;
    
    $sampleExpenses = [
        ['EXP-2024-001', 'EMP001', '2024-01-15', 'TRAVEL', 2500.00, 'Business trip to Manila for client meeting', 'approved'],
        ['EXP-2024-002', 'EMP002', '2024-01-18', 'MEALS', 850.00, 'Client dinner meeting at Makati restaurant', 'approved'],
        ['EXP-2024-003', 'EMP003', '2024-01-20', 'OFFICE', 1200.00, 'Office supplies and stationery', 'submitted'],
        ['EXP-2024-004', 'EMP001', '2024-01-22', 'COMM', 450.00, 'Mobile phone bill for business calls', 'draft'],
        ['EXP-2024-005', 'EMP004', '2024-01-25', 'TRAIN', 3500.00, 'Professional certification course', 'approved']
    ];
    
    foreach ($sampleExpenses as $expense) {
        // Get category_id
        $catQuery = "SELECT id FROM expense_categories WHERE code = ?";
        $catStmt = $conn->prepare($catQuery);
        $catStmt->bind_param('s', $expense[3]);
        $catStmt->execute();
        $catResult = $catStmt->get_result();
        
        if ($catResult->num_rows > 0) {
            $categoryId = $catResult->fetch_assoc()['id'];
            
            $insertExpQuery = "INSERT INTO expense_claims (claim_no, employee_external_no, expense_date, category_id, amount, description, status, created_by) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $insertExpStmt = $conn->prepare($insertExpQuery);
            $insertExpStmt->bind_param('sssidssi', 
                $expense[0], $expense[1], $expense[2], $categoryId, 
                $expense[4], $expense[5], $expense[6], $userId
            );
            
            if ($insertExpStmt->execute()) {
                echo "<div class='success'>✅ Created expense claim: {$expense[0]}</div>";
            } else {
                echo "<div class='error'>❌ Failed to create expense {$expense[0]}: " . $conn->error . "</div>";
            }
        }
    }
} else {
    echo "<div class='info'>ℹ️ Found $expenseCount existing expense claim(s). Skipping sample data insertion.</div>";
}

// Final Summary
echo "<div class='step'><strong>Setup Summary</strong></div>";

if (empty($errors)) {
    echo "<div class='success'><h3>✅ Setup Completed Successfully!</h3>
          <p>Your Expense Tracking module is now ready to use.</p>
          <a href='../modules/expense-tracking.php' class='btn'>Go to Expense Tracking Module</a>
          </div>";
} else {
    echo "<div class='error'><h3>⚠️ Setup Completed with Errors</h3>
          <p>Some errors occurred during setup:</p>
          <ul>";
    foreach ($errors as $error) {
        echo "<li>$error</li>";
    }
    echo "</ul>
          <p>Please check your database schema and try again.</p>
          </div>";
}

echo "
    </div>
</body>
</html>";
?>



