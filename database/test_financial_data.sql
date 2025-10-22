-- ========================================
-- TEST DATA FOR FINANCIAL REPORTING MODULE
-- This script inserts sample data for testing financial reports
-- ========================================

USE accounting_finance;

-- ========================================
-- 1. INSERT JOURNAL TYPES
-- ========================================

INSERT INTO journal_types (code, name, auto_reversing, description) VALUES
('GJ', 'General Journal', FALSE, 'General journal entries'),
('CR', 'Cash Receipt', FALSE, 'Cash receipts and collections'),
('CD', 'Cash Disbursement', FALSE, 'Cash payments and disbursements'),
('PR', 'Payroll', FALSE, 'Payroll journal entries'),
('AP', 'Accounts Payable', FALSE, 'Supplier invoices and payments'),
('AR', 'Accounts Receivable', FALSE, 'Customer invoices and collections')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ========================================
-- 2. INSERT FISCAL PERIODS
-- ========================================

INSERT INTO fiscal_periods (period_name, start_date, end_date, status) VALUES
('FY2025-Q1', '2025-01-01', '2025-03-31', 'open'),
('FY2025-Q2', '2025-04-01', '2025-06-30', 'open'),
('FY2025-Q3', '2025-07-01', '2025-09-30', 'open'),
('FY2025-Q4', '2025-10-01', '2025-12-31', 'open')
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

-- ========================================
-- 3. INSERT ACCOUNT TYPES
-- ========================================

INSERT INTO account_types (name, category, description) VALUES
('Current Assets', 'asset', 'Assets expected to be converted to cash within one year'),
('Non-Current Assets', 'asset', 'Long-term assets'),
('Current Liabilities', 'liability', 'Liabilities due within one year'),
('Non-Current Liabilities', 'liability', 'Long-term liabilities'),
('Equity', 'equity', 'Owner equity and retained earnings'),
('Operating Revenue', 'revenue', 'Revenue from primary business operations'),
('Other Revenue', 'revenue', 'Revenue from other sources'),
('Operating Expenses', 'expense', 'Expenses from primary business operations'),
('Other Expenses', 'expense', 'Non-operating expenses')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ========================================
-- 4. INSERT CHART OF ACCOUNTS
-- ========================================

-- Get the account type IDs (assuming they exist from schema or above insert)
SET @current_assets = (SELECT id FROM account_types WHERE name = 'Current Assets' LIMIT 1);
SET @noncurrent_assets = (SELECT id FROM account_types WHERE name = 'Non-Current Assets' LIMIT 1);
SET @current_liabilities = (SELECT id FROM account_types WHERE name = 'Current Liabilities' LIMIT 1);
SET @noncurrent_liabilities = (SELECT id FROM account_types WHERE name = 'Non-Current Liabilities' LIMIT 1);
SET @equity_type = (SELECT id FROM account_types WHERE name = 'Equity' LIMIT 1);
SET @operating_revenue = (SELECT id FROM account_types WHERE name = 'Operating Revenue' LIMIT 1);
SET @other_revenue = (SELECT id FROM account_types WHERE name = 'Other Revenue' LIMIT 1);
SET @operating_expenses = (SELECT id FROM account_types WHERE name = 'Operating Expenses' LIMIT 1);
SET @other_expenses = (SELECT id FROM account_types WHERE name = 'Other Expenses' LIMIT 1);

-- Get admin user ID
SET @admin_user = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- ASSETS
INSERT INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('1001', 'Cash in Bank - BDO', @current_assets, 'Main operating bank account', TRUE, @admin_user),
('1002', 'Cash in Bank - BPI', @current_assets, 'Secondary bank account', TRUE, @admin_user),
('1003', 'Petty Cash Fund', @current_assets, 'Office petty cash', TRUE, @admin_user),
('1100', 'Accounts Receivable - Trade', @current_assets, 'Customer receivables', TRUE, @admin_user),
('1200', 'Inventory', @current_assets, 'Merchandise inventory', TRUE, @admin_user),
('1300', 'Prepaid Expenses', @current_assets, 'Prepaid rent, insurance', TRUE, @admin_user),
('1500', 'Office Equipment', @noncurrent_assets, 'Computers, furniture', TRUE, @admin_user),
('1510', 'Accumulated Depreciation - Equipment', @noncurrent_assets, 'Depreciation contra account', TRUE, @admin_user),
('1600', 'Building', @noncurrent_assets, 'Office building', TRUE, @admin_user),
('1700', 'Land', @noncurrent_assets, 'Land property', TRUE, @admin_user)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- LIABILITIES
INSERT INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('2001', 'Accounts Payable - Trade', @current_liabilities, 'Supplier payables', TRUE, @admin_user),
('2100', 'Salaries Payable', @current_liabilities, 'Accrued salaries', TRUE, @admin_user),
('2200', 'Taxes Payable', @current_liabilities, 'Income tax payable', TRUE, @admin_user),
('2300', 'SSS/PhilHealth/Pag-IBIG Payable', @current_liabilities, 'Government contributions', TRUE, @admin_user),
('2400', 'Loans Payable - Current', @current_liabilities, 'Short-term loans', TRUE, @admin_user),
('2500', 'Loans Payable - Long Term', @noncurrent_liabilities, 'Long-term bank loans', TRUE, @admin_user)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- EQUITY
INSERT INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('3001', 'Capital Stock', @equity_type, 'Share capital', TRUE, @admin_user),
('3100', 'Retained Earnings', @equity_type, 'Accumulated profits', TRUE, @admin_user),
('3200', 'Current Year Profit/Loss', @equity_type, 'Current period earnings', TRUE, @admin_user)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- REVENUE
INSERT INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('4001', 'Sales Revenue', @operating_revenue, 'Product sales', TRUE, @admin_user),
('4002', 'Service Revenue', @operating_revenue, 'Service income', TRUE, @admin_user),
('4100', 'Interest Income', @other_revenue, 'Bank interest', TRUE, @admin_user),
('4200', 'Other Income', @other_revenue, 'Miscellaneous income', TRUE, @admin_user)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- EXPENSES
INSERT INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('5001', 'Cost of Goods Sold', @operating_expenses, 'Direct product costs', TRUE, @admin_user),
('5100', 'Salaries and Wages', @operating_expenses, 'Employee compensation', TRUE, @admin_user),
('5200', 'Rent Expense', @operating_expenses, 'Office rent', TRUE, @admin_user),
('5300', 'Utilities Expense', @operating_expenses, 'Electricity, water', TRUE, @admin_user),
('5400', 'Office Supplies Expense', @operating_expenses, 'Supplies and materials', TRUE, @admin_user),
('5500', 'Depreciation Expense', @operating_expenses, 'Asset depreciation', TRUE, @admin_user),
('5600', 'Insurance Expense', @operating_expenses, 'Insurance premiums', TRUE, @admin_user),
('5700', 'Professional Fees', @operating_expenses, 'Legal, accounting fees', TRUE, @admin_user),
('5800', 'Marketing and Advertising', @operating_expenses, 'Promotional expenses', TRUE, @admin_user),
('5900', 'Transportation and Travel', @operating_expenses, 'Travel costs', TRUE, @admin_user),
('6001', 'Interest Expense', @other_expenses, 'Loan interest', TRUE, @admin_user),
('6100', 'Miscellaneous Expense', @other_expenses, 'Other expenses', TRUE, @admin_user)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ========================================
-- 5. INSERT SAMPLE JOURNAL ENTRIES
-- ========================================

-- Get account IDs
SET @cash_bdo = (SELECT id FROM accounts WHERE code = '1001' LIMIT 1);
SET @cash_bpi = (SELECT id FROM accounts WHERE code = '1002' LIMIT 1);
SET @accounts_receivable = (SELECT id FROM accounts WHERE code = '1100' LIMIT 1);
SET @inventory = (SELECT id FROM accounts WHERE code = '1200' LIMIT 1);
SET @equipment = (SELECT id FROM accounts WHERE code = '1500' LIMIT 1);
SET @building = (SELECT id FROM accounts WHERE code = '1600' LIMIT 1);
SET @land = (SELECT id FROM accounts WHERE code = '1700' LIMIT 1);

SET @accounts_payable = (SELECT id FROM accounts WHERE code = '2001' LIMIT 1);
SET @salaries_payable = (SELECT id FROM accounts WHERE code = '2100' LIMIT 1);
SET @taxes_payable = (SELECT id FROM accounts WHERE code = '2200' LIMIT 1);
SET @loan_current = (SELECT id FROM accounts WHERE code = '2400' LIMIT 1);
SET @loan_longterm = (SELECT id FROM accounts WHERE code = '2500' LIMIT 1);

SET @capital = (SELECT id FROM accounts WHERE code = '3001' LIMIT 1);
SET @retained_earnings = (SELECT id FROM accounts WHERE code = '3100' LIMIT 1);

SET @sales_revenue = (SELECT id FROM accounts WHERE code = '4001' LIMIT 1);
SET @service_revenue = (SELECT id FROM accounts WHERE code = '4002' LIMIT 1);
SET @interest_income = (SELECT id FROM accounts WHERE code = '4100' LIMIT 1);

SET @cogs = (SELECT id FROM accounts WHERE code = '5001' LIMIT 1);
SET @salaries = (SELECT id FROM accounts WHERE code = '5100' LIMIT 1);
SET @rent = (SELECT id FROM accounts WHERE code = '5200' LIMIT 1);
SET @utilities = (SELECT id FROM accounts WHERE code = '5300' LIMIT 1);
SET @supplies = (SELECT id FROM accounts WHERE code = '5400' LIMIT 1);
SET @depreciation = (SELECT id FROM accounts WHERE code = '5500' LIMIT 1);
SET @insurance = (SELECT id FROM accounts WHERE code = '5600' LIMIT 1);
SET @professional_fees = (SELECT id FROM accounts WHERE code = '5700' LIMIT 1);
SET @marketing = (SELECT id FROM accounts WHERE code = '5800' LIMIT 1);
SET @travel = (SELECT id FROM accounts WHERE code = '5900' LIMIT 1);
SET @interest_expense = (SELECT id FROM accounts WHERE code = '6001' LIMIT 1);

SET @gj_type = (SELECT id FROM journal_types WHERE code = 'GJ' LIMIT 1);
SET @cr_type = (SELECT id FROM journal_types WHERE code = 'CR' LIMIT 1);
SET @cd_type = (SELECT id FROM journal_types WHERE code = 'CD' LIMIT 1);

SET @fiscal_q1 = (SELECT id FROM fiscal_periods WHERE period_name = 'FY2025-Q1' LIMIT 1);

-- Journal Entry 1: Initial Capital Investment
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0001', @gj_type, '2025-01-02', 'Initial capital investment', @fiscal_q1, 'INV-001', 5000000.00, 5000000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je1 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je1, @cash_bdo, 3000000.00, 0.00, 'Cash deposit - BDO'),
(@je1, @equipment, 500000.00, 0.00, 'Office equipment purchase'),
(@je1, @building, 1000000.00, 0.00, 'Building acquisition'),
(@je1, @land, 500000.00, 0.00, 'Land acquisition'),
(@je1, @capital, 0.00, 5000000.00, 'Owner capital contribution');

-- Journal Entry 2: Bank Loan
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0002', @gj_type, '2025-01-05', 'Bank loan proceeds', @fiscal_q1, 'LOAN-001', 1000000.00, 1000000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je2 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je2, @cash_bpi, 1000000.00, 0.00, 'Loan proceeds'),
(@je2, @loan_longterm, 0.00, 1000000.00, 'Long-term loan payable');

-- Journal Entry 3: Inventory Purchase
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0003', @gj_type, '2025-01-10', 'Inventory purchase on account', @fiscal_q1, 'PO-001', 800000.00, 800000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je3 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je3, @inventory, 800000.00, 0.00, 'Merchandise inventory'),
(@je3, @accounts_payable, 0.00, 800000.00, 'Trade payable');

-- Journal Entry 4: Sales Revenue (Cash)
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0004', @cr_type, '2025-01-15', 'Cash sales', @fiscal_q1, 'INV-2501', 450000.00, 450000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je4 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je4, @cash_bdo, 450000.00, 0.00, 'Cash received'),
(@je4, @sales_revenue, 0.00, 450000.00, 'Product sales');

-- Journal Entry 5: Cost of Goods Sold
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0005', @gj_type, '2025-01-15', 'COGS for sales', @fiscal_q1, 'INV-2501', 270000.00, 270000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je5 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je5, @cogs, 270000.00, 0.00, 'Cost of goods sold'),
(@je5, @inventory, 0.00, 270000.00, 'Inventory reduction');

-- Journal Entry 6: Service Revenue (Credit)
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0006', @gj_type, '2025-01-20', 'Service revenue on account', @fiscal_q1, 'INV-2502', 350000.00, 350000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je6 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je6, @accounts_receivable, 350000.00, 0.00, 'Customer receivable'),
(@je6, @service_revenue, 0.00, 350000.00, 'Service income');

-- Journal Entry 7: Salaries Payment
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0007', @cd_type, '2025-01-31', 'January salaries', @fiscal_q1, 'PAY-2501', 250000.00, 250000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je7 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je7, @salaries, 250000.00, 0.00, 'Employee salaries'),
(@je7, @cash_bdo, 0.00, 250000.00, 'Cash paid');

-- Journal Entry 8: Rent Expense
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0008', @cd_type, '2025-02-01', 'January rent payment', @fiscal_q1, 'RENT-JAN', 50000.00, 50000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je8 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je8, @rent, 50000.00, 0.00, 'Office rent'),
(@je8, @cash_bdo, 0.00, 50000.00, 'Cash paid');

-- Journal Entry 9: Utilities
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0009', @cd_type, '2025-02-05', 'Utilities payment', @fiscal_q1, 'UTIL-JAN', 35000.00, 35000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je9 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je9, @utilities, 35000.00, 0.00, 'Electricity and water'),
(@je9, @cash_bdo, 0.00, 35000.00, 'Cash paid');

-- Journal Entry 10: Supplies Purchase
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0010', @cd_type, '2025-02-10', 'Office supplies', @fiscal_q1, 'SUP-001', 25000.00, 25000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je10 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je10, @supplies, 25000.00, 0.00, 'Office supplies'),
(@je10, @cash_bdo, 0.00, 25000.00, 'Cash paid');

-- Journal Entry 11: Marketing Expense
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0011', @cd_type, '2025-02-15', 'Marketing campaign', @fiscal_q1, 'MKT-001', 75000.00, 75000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je11 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je11, @marketing, 75000.00, 0.00, 'Digital advertising'),
(@je11, @cash_bdo, 0.00, 75000.00, 'Cash paid');

-- Journal Entry 12: Professional Fees
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0012', @cd_type, '2025-02-20', 'Legal consultation', @fiscal_q1, 'LEGAL-001', 40000.00, 40000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je12 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je12, @professional_fees, 40000.00, 0.00, 'Legal fees'),
(@je12, @cash_bdo, 0.00, 40000.00, 'Cash paid');

-- Journal Entry 13: Interest Income
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0013', @cr_type, '2025-02-28', 'Bank interest earned', @fiscal_q1, 'INT-FEB', 5000.00, 5000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je13 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je13, @cash_bdo, 5000.00, 0.00, 'Interest received'),
(@je13, @interest_income, 0.00, 5000.00, 'Bank interest income');

-- Journal Entry 14: Loan Interest Payment
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0014', @cd_type, '2025-02-28', 'Loan interest payment', @fiscal_q1, 'LOAN-INT-FEB', 15000.00, 15000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je14 = LAST_INSERT_ID();

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je14, @interest_expense, 15000.00, 0.00, 'Interest on loan'),
(@je14, @cash_bpi, 0.00, 15000.00, 'Cash paid');

-- Journal Entry 15: Depreciation
INSERT INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-0015', @gj_type, '2025-02-28', 'Monthly depreciation', @fiscal_q1, 'DEP-FEB', 10000.00, 10000.00, 'posted', @admin_user, NOW(), @admin_user);

SET @je15 = LAST_INSERT_ID();

SET @accum_dep = (SELECT id FROM accounts WHERE code = '1510' LIMIT 1);

INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je15, @depreciation, 10000.00, 0.00, 'Equipment depreciation'),
(@je15, @accum_dep, 0.00, 10000.00, 'Accumulated depreciation');

-- ========================================
-- VERIFICATION SUMMARY
-- ========================================

SELECT '=== TEST DATA INSERTION COMPLETE ===' AS status;
SELECT 'Journal Entries Created:' AS info, COUNT(*) AS count FROM journal_entries;
SELECT 'Journal Lines Created:' AS info, COUNT(*) AS count FROM journal_lines;
SELECT 'Accounts Created:' AS info, COUNT(*) AS count FROM accounts;

-- Show Trial Balance Summary
SELECT 
    'TRIAL BALANCE VERIFICATION' AS report,
    SUM(debit) as total_debits,
    SUM(credit) as total_credits,
    SUM(debit) - SUM(credit) as difference
FROM journal_lines jl
INNER JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.status = 'posted';

SELECT '=== FINANCIAL REPORTING MODULE IS READY FOR TESTING ===' AS status;

