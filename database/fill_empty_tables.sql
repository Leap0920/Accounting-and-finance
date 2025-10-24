-- ========================================
-- FILL EMPTY TABLES ONLY
-- ========================================
-- This file fills ONLY the tables that are currently empty
-- Run this after your existing data files are already loaded

USE accounting_finance;

-- ========================================
-- 1. ACCOUNT BALANCES (Currently Empty)
-- ========================================
-- Calculate account balances from existing journal entries

INSERT IGNORE INTO account_balances (account_id, fiscal_period_id, opening_balance, debit_movements, credit_movements, closing_balance, last_updated)
SELECT 
    a.id as account_id,
    fp.id as fiscal_period_id,
    0.00 as opening_balance,
    COALESCE(SUM(jl.debit), 0.00) as debit_movements,
    COALESCE(SUM(jl.credit), 0.00) as credit_movements,
    COALESCE(SUM(jl.debit), 0.00) - COALESCE(SUM(jl.credit), 0.00) as closing_balance,
    NOW() as last_updated
FROM accounts a
CROSS JOIN fiscal_periods fp
LEFT JOIN journal_lines jl ON a.id = jl.account_id
LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.fiscal_period_id = fp.id AND je.status = 'posted'
WHERE a.is_active = 1
GROUP BY a.id, fp.id;

-- ========================================
-- 2. COST CENTERS (Referenced but Missing)
-- ========================================
-- Note: cost_center_id in journal_lines references a table that doesn't exist in schema
-- We'll leave these as NULL since the table doesn't exist

-- ========================================
-- 2. INTEGRATION LOGS (Currently Empty)
-- ========================================

INSERT IGNORE INTO integration_logs (source_system, endpoint, request_type, payload, response, status, error_message, created_at) VALUES
('HRIS', '/api/employees/sync', 'POST', '{"action":"sync","date":"2024-12-01"}', '{"status":"success","records_processed":10}', 'success', NULL, '2024-12-01 08:00:00'),
('HRIS', '/api/payroll/export', 'GET', '{"period":"2024-12","format":"csv"}', '{"status":"success","file_path":"/exports/payroll_2024_12.csv"}', 'success', NULL, '2024-12-15 17:30:00'),
('BANK_API', '/api/transactions/sync', 'POST', '{"account":"BDO","date":"2024-12-15"}', '{"status":"success","transactions":25}', 'success', NULL, '2024-12-15 18:00:00'),
('TAX_SYSTEM', '/api/compliance/submit', 'POST', '{"report_type":"bir","period":"2024-Q4"}', '{"status":"error","code":"VALIDATION_FAILED"}', 'error', 'Missing required field: tax_id', '2024-12-15 19:00:00'),
('ACCOUNTING_SOFTWARE', '/api/journal/import', 'POST', '{"entries":15,"format":"json"}', '{"status":"success","imported":15}', 'success', NULL, '2024-12-15 20:00:00'),
('PAYMENT_GATEWAY', '/api/payments/process', 'POST', '{"amount":50000,"currency":"PHP"}', '{"status":"pending","transaction_id":"TXN123456"}', 'pending', NULL, '2024-12-15 21:00:00'),
('EXPENSE_SYSTEM', '/api/receipts/upload', 'POST', '{"employee_id":"EMP001","amount":2500}', '{"status":"success","receipt_id":"RCP789"}', 'success', NULL, '2024-12-15 22:00:00'),
('LOAN_SYSTEM', '/api/loans/calculate', 'POST', '{"principal":100000,"rate":0.05,"term":12}', '{"status":"success","monthly_payment":8560.75}', 'success', NULL, '2024-12-15 23:00:00'),
('BANK_API', '/api/balance/check', 'GET', '{"account":"BANK001"}', '{"status":"success","balance":2500000}', 'success', NULL, '2024-12-16 08:00:00'),
('HRIS', '/api/attendance/sync', 'POST', '{"date":"2024-12-16"}', '{"status":"success","records":10}', 'success', NULL, '2024-12-16 09:00:00');



-- ========================================
-- 6. ADDITIONAL AUDIT LOGS (Only Few Exist)
-- ========================================

INSERT IGNORE INTO audit_logs (user_id, ip_address, action, object_type, object_id, old_values, new_values, additional_info, created_at) VALUES
(1, '192.168.1.100', 'Create Journal Entry', 'journal_entry', 'JE-2025-0011', NULL, '{"amount":75000,"type":"marketing"}', '{"module":"financial_reporting"}', NOW() - INTERVAL 10 DAY),
(1, '192.168.1.101', 'Process Payroll', 'payroll_run', 'PR-2024-12', NULL, '{"employees":10,"total_gross":250000}', '{"period":"2024-12"}', NOW() - INTERVAL 8 DAY),
(1, '192.168.1.102', 'Generate Compliance Report', 'compliance_report', 'CR-2024-Q4', NULL, '{"type":"gaap","score":95}', '{"period":"2024-Q4"}', NOW() - INTERVAL 5 DAY),
(1, '192.168.1.103', 'Approve Expense Claim', 'expense_claim', 'EXP025', '{"status":"submitted"}', '{"status":"approved","approved_by":1}', '{"amount":3000,"category":"equipment"}', NOW() - INTERVAL 3 DAY),
(1, '127.0.0.1', 'System Backup', 'system', 'backup_2024_12_15', NULL, '{"status":"completed","size":"2.5GB"}', '{"type":"full_backup"}', NOW() - INTERVAL 1 DAY),
(1, '192.168.1.100', 'Update Account Balance', 'account_balance', 'AB-1001-Q4', '{"balance":500000}', '{"balance":525000}', '{"adjustment":"monthly_interest"}', NOW() - INTERVAL 15 DAY),
(1, '192.168.1.101', 'Export Payroll Data', 'payroll_export', 'PE-2024-12', NULL, '{"format":"csv","records":10}', '{"period":"2024-12"}', NOW() - INTERVAL 12 DAY),
(1, '192.168.1.102', 'View Financial Report', 'financial_report', 'FR-BS-2024-Q4', NULL, NULL, '{"report_type":"balance_sheet","period":"2024-Q4"}', NOW() - INTERVAL 7 DAY),
(1, '127.0.0.1', 'Login', 'user_session', '1', NULL, '{"login_time":"2024-12-15 08:00:00"}', '{"ip":"127.0.0.1"}', NOW() - INTERVAL 20 DAY),
(1, '192.168.1.100', 'Login', 'user_session', '1', NULL, '{"login_time":"2024-12-15 08:30:00"}', '{"ip":"192.168.1.100"}', NOW() - INTERVAL 18 DAY);

-- ========================================
-- 7. ADDITIONAL BANK ACCOUNTS (Only 3 Exist)
-- ========================================

INSERT IGNORE INTO bank_accounts (code, name, bank_name, account_number, currency, current_balance, is_active) VALUES
('BANK004', 'Evergreen Investment Account', 'Security Bank', 'SB123456789', 'PHP', 1500000.00, TRUE),
('BANK005', 'Evergreen Savings Account', 'EastWest Bank', 'EW987654321', 'PHP', 750000.00, TRUE),
('BANK006', 'Evergreen USD Account', 'BDO Unibank', 'BDO-USD-001', 'USD', 50000.00, TRUE);

-- ========================================
-- 8. ADDITIONAL PAYMENT RECORDS
-- ========================================

INSERT IGNORE INTO payments (payment_no, payment_date, payment_type, from_bank_account_id, payee_name, amount, reference_no, memo, status, journal_entry_id, created_by, created_at) VALUES
('PAY036', CURDATE() - INTERVAL 25 DAY, 'bank_transfer', 1, 'Office Equipment Supplier', 15000.00, 'EQUIP-2024-001', 'New office chairs', 'completed', NULL, 1, NOW() - INTERVAL 25 DAY),
('PAY037', CURDATE() - INTERVAL 20 DAY, 'check', 1, 'Marketing Agency', 30000.00, 'MKT-2024-Q4', 'Q4 marketing campaign', 'completed', NULL, 1, NOW() - INTERVAL 20 DAY),
('PAY038', CURDATE() - INTERVAL 15 DAY, 'bank_transfer', 2, 'Software License Co.', 12000.00, 'LIC-2024-001', 'Annual software licenses', 'completed', NULL, 1, NOW() - INTERVAL 15 DAY),
('PAY039', CURDATE() - INTERVAL 10 DAY, 'cash', NULL, 'Office Maintenance', 5000.00, 'MAINT-2024-001', 'Office cleaning services', 'completed', NULL, 1, NOW() - INTERVAL 10 DAY),
('PAY040', CURDATE() - INTERVAL 5 DAY, 'bank_transfer', 3, 'Insurance Provider', 25000.00, 'INS-2024-Q4', 'Quarterly insurance premium', 'pending', NULL, 1, NOW() - INTERVAL 5 DAY);

-- ========================================
-- 9. ADDITIONAL LOAN RECORDS
-- ========================================

INSERT IGNORE INTO loans (loan_no, loan_type_id, borrower_external_no, principal_amount, interest_rate, start_date, term_months, monthly_payment, current_balance, status, created_by, created_at) VALUES
('LN-1015', 1, 'EMP002', 35000.00, 0.05, CURDATE() - INTERVAL 60 DAY, 12, 3150.00, 35000.00, 'active', 1, NOW() - INTERVAL 60 DAY),
('LN-1016', 2, 'EMP004', 18000.00, 0.08, CURDATE() - INTERVAL 45 DAY, 6, 3240.00, 18000.00, 'active', 1, NOW() - INTERVAL 45 DAY),
('LN-1017', 1, 'EMP006', 28000.00, 0.05, CURDATE() - INTERVAL 30 DAY, 12, 2520.00, 28000.00, 'active', 1, NOW() - INTERVAL 30 DAY),
('LN-1018', 3, 'EMP008', 200000.00, 0.06, CURDATE() - INTERVAL 90 DAY, 60, 4000.00, 200000.00, 'active', 1, NOW() - INTERVAL 90 DAY),
('LN-1019', 4, 'EMP010', 35000.00, 0.04, CURDATE() - INTERVAL 20 DAY, 24, 1500.00, 35000.00, 'active', 1, NOW() - INTERVAL 20 DAY);

-- Additional Loan Payments
INSERT IGNORE INTO loan_payments (loan_id, payment_date, amount, principal_amount, interest_amount, payment_reference, journal_entry_id, created_at) VALUES
(15, CURDATE() - INTERVAL 25 DAY, 3150.00, 2800.00, 350.00, 'PAY-2024-12-001', NULL, NOW() - INTERVAL 25 DAY),
(16, CURDATE() - INTERVAL 10 DAY, 3240.00, 3000.00, 240.00, 'PAY-2024-12-002', NULL, NOW() - INTERVAL 10 DAY),
(17, CURDATE() - INTERVAL 22 DAY, 2520.00, 2300.00, 220.00, 'PAY-2024-12-003', NULL, NOW() - INTERVAL 22 DAY),
(18, CURDATE() - INTERVAL 18 DAY, 4000.00, 3000.00, 1000.00, 'PAY-2024-12-004', NULL, NOW() - INTERVAL 18 DAY),
(19, CURDATE() - INTERVAL 8 DAY, 1500.00, 1300.00, 200.00, 'PAY-2024-12-005', NULL, NOW() - INTERVAL 8 DAY);

-- ========================================
-- 10. ADDITIONAL EXPENSE CLAIMS
-- ========================================

INSERT IGNORE INTO expense_claims (claim_no, employee_external_no, expense_date, category_id, amount, description, status, approved_by, approved_at, payment_id, journal_entry_id, created_at) VALUES
('EXP026', 'EMP001', CURDATE() - INTERVAL 25 DAY, 1, 1200.00, 'Office supplies for December', 'approved', 1, NOW() - INTERVAL 24 DAY, 36, NULL, NOW() - INTERVAL 25 DAY),
('EXP027', 'EMP003', CURDATE() - INTERVAL 20 DAY, 2, 2500.00, 'Client meeting travel', 'submitted', NULL, NULL, NULL, NULL, NOW() - INTERVAL 20 DAY),
('EXP028', 'EMP005', CURDATE() - INTERVAL 17 DAY, 3, 800.00, 'Team dinner meeting', 'approved', 1, NOW() - INTERVAL 16 DAY, 37, NULL, NOW() - INTERVAL 17 DAY),
('EXP029', 'EMP007', CURDATE() - INTERVAL 15 DAY, 2, 1800.00, 'Sales conference attendance', 'pending', NULL, NULL, NULL, NULL, NOW() - INTERVAL 15 DAY),
('EXP030', 'EMP009', CURDATE() - INTERVAL 13 DAY, 6, 2000.00, 'IT training certification', 'approved', 1, NOW() - INTERVAL 12 DAY, 38, NULL, NOW() - INTERVAL 13 DAY),
('EXP031', 'EMP002', CURDATE() - INTERVAL 10 DAY, 1, 600.00, 'Office supplies', 'draft', NULL, NULL, NULL, NULL, NOW() - INTERVAL 10 DAY),
('EXP032', 'EMP004', CURDATE() - INTERVAL 7 DAY, 3, 450.00, 'Marketing team lunch', 'submitted', NULL, NULL, NULL, NULL, NOW() - INTERVAL 7 DAY),
('EXP033', 'EMP006', CURDATE() - INTERVAL 5 DAY, 2, 1200.00, 'Customer service training', 'approved', 1, NOW() - INTERVAL 5 DAY, 39, NULL, NOW() - INTERVAL 5 DAY);

-- ========================================
-- 11. ADDITIONAL COMPLIANCE REPORTS
-- ========================================

INSERT IGNORE INTO compliance_reports (report_type, period_start, period_end, generated_date, generated_by, status, file_path, report_data, compliance_score, issues_found, created_at) VALUES
('gaap', CURDATE() - INTERVAL 60 DAY, CURDATE() - INTERVAL 30 DAY, NOW() - INTERVAL 25 DAY, 1, 'completed', '/reports/gaap_2024_10.pdf', '{"total_assets":5000000,"total_liabilities":2000000,"net_income":500000}', 98.50, 'Excellent compliance. All transactions properly documented.', NOW() - INTERVAL 25 DAY),
('sox', CURDATE() - INTERVAL 45 DAY, CURDATE() - INTERVAL 15 DAY, NOW() - INTERVAL 10 DAY, 1, 'completed', '/reports/sox_2024_11.pdf', '{"segregation_score":95,"audit_trail":100,"controls":90}', 95.00, 'Strong internal controls. Minor improvement needed in approval workflows.', NOW() - INTERVAL 10 DAY),
('bir', CURDATE() - INTERVAL 30 DAY, CURDATE(), NOW() - INTERVAL 5 DAY, 1, 'generating', NULL, NULL, NULL, NULL, NOW() - INTERVAL 5 DAY),
('ifrs', CURDATE() - INTERVAL 90 DAY, CURDATE() - INTERVAL 60 DAY, NOW() - INTERVAL 55 DAY, 1, 'completed', '/reports/ifrs_2024_q4.pdf', '{"revenue_recognition":100,"asset_classification":95,"disclosure":90}', 95.00, 'IFRS standards properly implemented. Consider enhancing disclosure notes.', NOW() - INTERVAL 55 DAY),
('gaap', CURDATE() - INTERVAL 20 DAY, CURDATE(), NOW() - INTERVAL 3 DAY, 1, 'failed', NULL, NULL, 0.00, 'Unable to generate report due to incomplete journal entries for December.', NOW() - INTERVAL 3 DAY);

-- ========================================
-- 12. ADDITIONAL PAYROLL DATA
-- ========================================

-- Additional Payroll Periods
INSERT IGNORE INTO payroll_periods (period_start, period_end, frequency, status, created_at) VALUES
(CURDATE() - INTERVAL 30 DAY, CURDATE(), 'monthly', 'processing', NOW() - INTERVAL 30 DAY),
(CURDATE(), CURDATE() + INTERVAL 30 DAY, 'monthly', 'open', NOW());

-- Additional Payroll Runs
INSERT IGNORE INTO payroll_runs (payroll_period_id, run_by_user_id, run_at, total_gross, total_deductions, total_net, status, journal_entry_id, created_at) VALUES
(3, 1, NOW() - INTERVAL 10 DAY, 270000.00, 48000.00, 222000.00, 'draft', NULL, NOW() - INTERVAL 10 DAY);

-- Additional Payslips
INSERT IGNORE INTO payslips (payroll_run_id, employee_external_no, gross_pay, total_deductions, net_pay, payslip_json, created_at) VALUES
(3, 'EMP001', 26000.00, 4600.00, 21400.00, '{"basic_salary": 26000, "allowances": 2000, "deductions": 4600, "bonus": 2000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP002', 29000.00, 5100.00, 23900.00, '{"basic_salary": 29000, "allowances": 2000, "deductions": 5100, "bonus": 2000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP003', 31000.00, 5500.00, 25500.00, '{"basic_salary": 31000, "allowances": 2000, "deductions": 5500, "bonus": 2000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP004', 23000.00, 4100.00, 18900.00, '{"basic_salary": 23000, "allowances": 2000, "deductions": 4100, "bonus": 1500}', NOW() - INTERVAL 10 DAY),
(3, 'EMP005', 33000.00, 5800.00, 27200.00, '{"basic_salary": 33000, "allowances": 2000, "deductions": 5800, "bonus": 2500}', NOW() - INTERVAL 10 DAY),
(3, 'EMP006', 19000.00, 3400.00, 15600.00, '{"basic_salary": 19000, "allowances": 1500, "deductions": 3400, "bonus": 1000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP007', 27000.00, 4800.00, 22200.00, '{"basic_salary": 27000, "allowances": 2000, "deductions": 4800, "bonus": 2000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP008', 25000.00, 4400.00, 20600.00, '{"basic_salary": 25000, "allowances": 2000, "deductions": 4400, "bonus": 1500}', NOW() - INTERVAL 10 DAY),
(3, 'EMP009', 30000.00, 5300.00, 24700.00, '{"basic_salary": 30000, "allowances": 2000, "deductions": 5300, "bonus": 2000}', NOW() - INTERVAL 10 DAY),
(3, 'EMP010', 16000.00, 2800.00, 13200.00, '{"basic_salary": 16000, "allowances": 1000, "deductions": 2800, "bonus": 1000}', NOW() - INTERVAL 10 DAY);

-- ========================================
-- 13. RECENT JOURNAL ENTRIES (Last 30 Days)
-- ========================================
-- These entries are critical for compliance status calculations

INSERT IGNORE INTO journal_entries (reference_no, description, entry_date, fiscal_period_id, journal_type_id, status, created_by, posted_by, created_at, posted_at) VALUES
('JE-2025-101', 'Sales Revenue - October', CURDATE() - INTERVAL 5 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
('JE-2025-102', 'Office Expenses and Supplies', CURDATE() - INTERVAL 10 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
('JE-2025-103', 'Tax Withholding Payment', CURDATE() - INTERVAL 3 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('JE-2025-104', 'Asset Purchase - Equipment', CURDATE() - INTERVAL 15 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),
('JE-2025-105', 'Loan Payment and Interest', CURDATE() - INTERVAL 7 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
('JE-2025-106', 'VAT Collection - Sales', CURDATE() - INTERVAL 12 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),
('JE-2025-107', 'Payroll Processing', CURDATE() - INTERVAL 8 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),
('JE-2025-108', 'Service Revenue', CURDATE() - INTERVAL 2 DAY, 1, 1, 'posted', 1, 1, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY);

-- Journal Lines for Recent Entries (Balanced Debits and Credits)
INSERT IGNORE INTO journal_lines (journal_entry_id, line_number, account_id, debit, credit, description) VALUES
-- JE-2025-101: Sales Revenue
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-101'), 1, 1, 50000.00, 0.00, 'Cash received from sales'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-101'), 2, 10, 0.00, 50000.00, 'Sales revenue'),
-- JE-2025-102: Office Expenses
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-102'), 1, 3, 8000.00, 0.00, 'Office supplies expense'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-102'), 2, 1, 0.00, 8000.00, 'Cash paid'),
-- JE-2025-103: Tax Payment
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-103'), 1, 15, 5000.00, 0.00, 'Withholding tax expense'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-103'), 2, 1, 0.00, 5000.00, 'Cash paid for tax'),
-- JE-2025-104: Asset Purchase
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-104'), 1, 5, 25000.00, 0.00, 'Equipment purchased'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-104'), 2, 1, 0.00, 25000.00, 'Cash paid for equipment'),
-- JE-2025-105: Loan Payment
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-105'), 1, 12, 3000.00, 0.00, 'Loan principal payment'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-105'), 2, 14, 500.00, 0.00, 'Interest expense'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-105'), 3, 1, 0.00, 3500.00, 'Cash paid'),
-- JE-2025-106: VAT Collection
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-106'), 1, 1, 11200.00, 0.00, 'Cash received'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-106'), 2, 10, 0.00, 10000.00, 'Sales revenue'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-106'), 3, 16, 0.00, 1200.00, 'VAT payable'),
-- JE-2025-107: Payroll
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-107'), 1, 13, 30000.00, 0.00, 'Salary expense'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-107'), 2, 1, 0.00, 30000.00, 'Cash paid for salaries'),
-- JE-2025-108: Service Revenue
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-108'), 1, 1, 15000.00, 0.00, 'Cash received'),
((SELECT id FROM journal_entries WHERE reference_no = 'JE-2025-108'), 2, 10, 0.00, 15000.00, 'Service revenue');

-- ========================================
-- 14. ADDITIONAL JOURNAL TYPES
-- ========================================

INSERT IGNORE INTO journal_types (code, name, auto_reversing, description) VALUES
('AJ', 'Adjusting Journal', TRUE, 'Period-end adjusting entries'),
('REV', 'Reversing Entry', TRUE, 'Reversing entries for accruals'),
('CLOSE', 'Closing Entry', FALSE, 'Year-end closing entries'),
('OPEN', 'Opening Entry', FALSE, 'Year-beginning opening entries');

-- ========================================
-- 15. ADDITIONAL ACCOUNT TYPES
-- ========================================

INSERT IGNORE INTO account_types (name, category, description) VALUES
('Intangible Assets', 'asset', 'Non-physical assets like patents, trademarks'),
('Accrued Liabilities', 'liability', 'Expenses incurred but not yet paid'),
('Deferred Revenue', 'liability', 'Revenue received but not yet earned'),
('Accumulated Depreciation', 'asset', 'Contra-asset for depreciation'),
('Cost of Sales', 'expense', 'Direct costs of goods sold'),
('Interest Income', 'revenue', 'Interest earned on investments'),
('Interest Expense', 'expense', 'Interest paid on loans');

-- ========================================
-- VERIFICATION SUMMARY
-- ========================================

SELECT '=== EMPTY TABLES FILLED SUCCESSFULLY ===' AS status;

-- Show record counts for filled tables
SELECT 'Account Balances:' AS table_name, COUNT(*) AS record_count FROM account_balances
UNION ALL
SELECT 'Integration Logs:', COUNT(*) FROM integration_logs
UNION ALL
SELECT 'Audit Logs:', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'Bank Accounts:', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'Payments:', COUNT(*) FROM payments
UNION ALL
SELECT 'Loans:', COUNT(*) FROM loans
UNION ALL
SELECT 'Loan Payments:', COUNT(*) FROM loan_payments
UNION ALL
SELECT 'Expense Claims:', COUNT(*) FROM expense_claims
UNION ALL
SELECT 'Compliance Reports:', COUNT(*) FROM compliance_reports
UNION ALL
SELECT 'Payroll Periods:', COUNT(*) FROM payroll_periods
UNION ALL
SELECT 'Payroll Runs:', COUNT(*) FROM payroll_runs
UNION ALL
SELECT 'Payslips:', COUNT(*) FROM payslips
UNION ALL
SELECT 'Journal Types:', COUNT(*) FROM journal_types
UNION ALL
SELECT 'Account Types:', COUNT(*) FROM account_types;

-- Verify account balances are calculated correctly
SELECT 
    'ACCOUNT BALANCE VERIFICATION' AS check_type,
    COUNT(*) as total_accounts,
    SUM(CASE WHEN closing_balance > 0 THEN 1 ELSE 0 END) as debit_balance_accounts,
    SUM(CASE WHEN closing_balance < 0 THEN 1 ELSE 0 END) as credit_balance_accounts,
    SUM(CASE WHEN closing_balance = 0 THEN 1 ELSE 0 END) as zero_balance_accounts
FROM account_balances;

-- Trial balance check
SELECT 
    'TRIAL BALANCE CHECK' AS check_type,
    SUM(debit_movements) as total_debits,
    SUM(credit_movements) as total_credits,
    SUM(debit_movements) - SUM(credit_movements) as difference,
    CASE 
        WHEN ABS(SUM(debit_movements) - SUM(credit_movements)) < 0.01 THEN 'BALANCED'
        ELSE 'UNBALANCED'
    END as status
FROM account_balances;

SELECT '=== ALL EMPTY TABLES NOW HAVE DATA ===' AS final_status;
