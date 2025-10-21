-- ========================================
-- 📋 COPY ALL OF THIS AND PASTE INTO phpMyAdmin
-- ========================================
-- Instructions:
-- 1. Open phpMyAdmin: http://localhost/phpmyadmin
-- 2. Click "accounting_finance" database (left sidebar)
-- 3. Click "SQL" tab (at top)
-- 4. COPY THIS ENTIRE FILE (Ctrl+A, Ctrl+C)
-- 5. PASTE into SQL box (Ctrl+V)
-- 6. Click "Go" button
-- 7. Wait for success message
-- 8. Open Transaction Recording module to see 10 transactions!
-- ========================================

-- Make sure we're using the right database
USE accounting_finance;

-- Insert Fiscal Periods
INSERT IGNORE INTO fiscal_periods (period_name, start_date, end_date, status) VALUES
('October 2025', '2025-10-01', '2025-10-31', 'open'),
('November 2025', '2025-11-01', '2025-11-30', 'open'),
('December 2025', '2025-12-01', '2025-12-31', 'open');

-- Insert Journal Types  
INSERT IGNORE INTO journal_types (code, name, auto_reversing, description) VALUES
('GJ', 'General Journal', FALSE, 'General journal entries'),
('CR', 'Cash Receipt', FALSE, 'Cash received'),
('CD', 'Cash Disbursement', FALSE, 'Cash payments'),
('PR', 'Payroll', FALSE, 'Payroll entries'),
('AP', 'Accounts Payable', FALSE, 'Vendor invoices'),
('AR', 'Accounts Receivable', FALSE, 'Customer invoices');

-- Insert Account Types
INSERT IGNORE INTO account_types (name, category, description) VALUES
('Current Assets', 'asset', 'Assets expected to be converted to cash within one year'),
('Fixed Assets', 'asset', 'Long-term tangible assets'),
('Current Liabilities', 'liability', 'Obligations due within one year'),
('Long-term Liabilities', 'liability', 'Obligations due after one year'),
('Equity', 'equity', 'Owners equity and retained earnings'),
('Operating Revenue', 'revenue', 'Revenue from normal business operations'),
('Other Revenue', 'revenue', 'Non-operating revenue'),
('Operating Expenses', 'expense', 'Expenses from normal business operations'),
('Administrative Expenses', 'expense', 'General and administrative costs');

-- Insert Chart of Accounts
INSERT IGNORE INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
-- Assets
('1001', 'Cash on Hand', 1, 'Petty cash', TRUE, 1),
('1002', 'Cash in Bank - BPI', 1, 'BPI Savings', TRUE, 1),
('1003', 'Cash in Bank - BDO', 1, 'BDO Current', TRUE, 1),
('1101', 'Accounts Receivable', 1, 'Trade receivables', TRUE, 1),
('1501', 'Office Equipment', 2, 'Computers, furniture', TRUE, 1),
('1503', 'Accumulated Depreciation', 2, 'Accumulated depreciation', TRUE, 1),
-- Liabilities
('2001', 'Accounts Payable', 3, 'Trade payables', TRUE, 1),
('2002', 'SSS Payable', 3, 'SSS contributions', TRUE, 1),
('2003', 'PhilHealth Payable', 3, 'PhilHealth contributions', TRUE, 1),
('2004', 'Pag-IBIG Payable', 3, 'Pag-IBIG contributions', TRUE, 1),
('2005', 'Withholding Tax Payable', 3, 'Tax withheld', TRUE, 1),
-- Equity
('3001', 'Capital', 5, 'Owners capital', TRUE, 1),
-- Revenue
('4001', 'Sales Revenue', 6, 'Product sales', TRUE, 1),
('4002', 'Service Revenue', 6, 'Service income', TRUE, 1),
-- Expenses
('5101', 'Salaries and Wages', 8, 'Employee salaries', TRUE, 1),
('5102', 'SSS Expense', 8, 'SSS employer share', TRUE, 1),
('5103', 'PhilHealth Expense', 8, 'PhilHealth employer', TRUE, 1),
('5104', 'Pag-IBIG Expense', 8, 'Pag-IBIG employer', TRUE, 1),
('5105', 'Employee Benefits', 8, 'Other benefits', TRUE, 1),
('5201', 'Rent Expense', 9, 'Office rent', TRUE, 1),
('5202', 'Utilities Expense', 9, 'Electricity, water', TRUE, 1),
('5203', 'Office Supplies', 9, 'Supplies', TRUE, 1),
('5204', 'Transportation', 9, 'Fuel, vehicle', TRUE, 1),
('5205', 'Depreciation Expense', 9, 'Depreciation', TRUE, 1);

-- Insert Sample Transactions
-- Transaction 1: Cash Sale (Today)
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by) 
VALUES ('JE-2025-001', 1, CURDATE(), 'Cash sales for the day', 1, 'SALE-001', 50000.00, 50000.00, 'posted', 1, NOW(), 1);
SET @je1 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-001');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je1, (SELECT id FROM accounts WHERE code = '1001'), 50000.00, 0.00, 'Cash from sales'),
(@je1, (SELECT id FROM accounts WHERE code = '4001'), 0.00, 50000.00, 'Sales revenue');

-- Transaction 2: Office Supplies
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-002', 3, '2025-10-15', 'Office supplies purchase', 1, 'PO-1001', 5500.00, 5500.00, 'posted', 1, '2025-10-15 14:30:00', 1);
SET @je2 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-002');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je2, (SELECT id FROM accounts WHERE code = '5203'), 5500.00, 0.00, 'Supplies purchased'),
(@je2, (SELECT id FROM accounts WHERE code = '1002'), 0.00, 5500.00, 'Payment via BPI');

-- Transaction 3: Rent Payment
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-003', 3, '2025-10-01', 'Monthly rent - October 2025', 1, 'RENT-OCT', 25000.00, 25000.00, 'posted', 1, '2025-10-01 09:00:00', 1);
SET @je3 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-003');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je3, (SELECT id FROM accounts WHERE code = '5201'), 25000.00, 0.00, 'Office rent'),
(@je3, (SELECT id FROM accounts WHERE code = '1003'), 0.00, 25000.00, 'Paid via BDO');

-- Transaction 4: Utilities
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-004', 3, '2025-10-10', 'Utilities payment', 1, 'UTIL-001', 8750.00, 8750.00, 'posted', 1, '2025-10-10 16:00:00', 1);
SET @je4 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-004');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je4, (SELECT id FROM accounts WHERE code = '5202'), 8750.00, 0.00, 'Electricity and internet'),
(@je4, (SELECT id FROM accounts WHERE code = '1002'), 0.00, 8750.00, 'Bank transfer');

-- Transaction 5: Payroll
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-005', 4, '2025-10-15', 'Payroll Oct 1-15', 1, 'PR-OCT-1', 85000.00, 85000.00, 'posted', 1, '2025-10-15 17:00:00', 1);
SET @je5 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-005');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je5, (SELECT id FROM accounts WHERE code = '5101'), 75000.00, 0.00, 'Salaries'),
(@je5, (SELECT id FROM accounts WHERE code = '5102'), 3375.00, 0.00, 'SSS employer'),
(@je5, (SELECT id FROM accounts WHERE code = '5103'), 3375.00, 0.00, 'PhilHealth employer'),
(@je5, (SELECT id FROM accounts WHERE code = '5104'), 1500.00, 0.00, 'Pag-IBIG employer'),
(@je5, (SELECT id FROM accounts WHERE code = '5105'), 1750.00, 0.00, 'Benefits'),
(@je5, (SELECT id FROM accounts WHERE code = '2002'), 0.00, 6750.00, 'SSS payable'),
(@je5, (SELECT id FROM accounts WHERE code = '2003'), 0.00, 6750.00, 'PhilHealth payable'),
(@je5, (SELECT id FROM accounts WHERE code = '2004'), 0.00, 3000.00, 'Pag-IBIG payable'),
(@je5, (SELECT id FROM accounts WHERE code = '2005'), 0.00, 7500.00, 'Tax payable'),
(@je5, (SELECT id FROM accounts WHERE code = '1002'), 0.00, 61000.00, 'Net pay');

-- Transaction 6: Customer Payment (Today)
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-006', 2, CURDATE(), 'Payment from ABC Corp', 1, 'CR-1001', 35000.00, 35000.00, 'posted', 1, NOW(), 1);
SET @je6 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-006');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je6, (SELECT id FROM accounts WHERE code = '1002'), 35000.00, 0.00, 'Cash received'),
(@je6, (SELECT id FROM accounts WHERE code = '1101'), 0.00, 35000.00, 'AR collection');

-- Transaction 7: Equipment Purchase
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-007', 5, '2025-10-05', 'Purchase computers', 1, 'INV-2001', 125000.00, 125000.00, 'posted', 1, '2025-10-05 11:00:00', 1);
SET @je7 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-007');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je7, (SELECT id FROM accounts WHERE code = '1501'), 125000.00, 0.00, 'Equipment purchased'),
(@je7, (SELECT id FROM accounts WHERE code = '2001'), 0.00, 125000.00, 'AP to supplier');

-- Transaction 8: Draft Entry
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, created_by)
VALUES ('JE-2025-008', 1, CURDATE(), 'Depreciation for October', 1, 'ADJ-DEP', 5000.00, 5000.00, 'draft', 1);
SET @je8 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-008');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je8, (SELECT id FROM accounts WHERE code = '5205'), 5000.00, 0.00, 'Monthly depreciation'),
(@je8, (SELECT id FROM accounts WHERE code = '1503'), 0.00, 5000.00, 'Accum. depreciation');

-- Transaction 9: Transportation
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-009', 3, '2025-10-12', 'Fuel and maintenance', 1, 'TRANS-001', 4200.00, 4200.00, 'posted', 1, '2025-10-12 15:30:00', 1);
SET @je9 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-009');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je9, (SELECT id FROM accounts WHERE code = '5204'), 4200.00, 0.00, 'Fuel'),
(@je9, (SELECT id FROM accounts WHERE code = '1001'), 0.00, 4200.00, 'Cash');

-- Transaction 10: Service Revenue (Today)
INSERT IGNORE INTO journal_entries (journal_no, journal_type_id, entry_date, description, fiscal_period_id, reference_no, total_debit, total_credit, status, posted_by, posted_at, created_by)
VALUES ('JE-2025-010', 6, CURDATE(), 'Consulting services', 1, 'INV-5001', 75000.00, 75000.00, 'posted', 1, NOW(), 1);
SET @je10 = (SELECT id FROM journal_entries WHERE journal_no = 'JE-2025-010');
INSERT IGNORE INTO journal_lines (journal_entry_id, account_id, debit, credit, memo) VALUES
(@je10, (SELECT id FROM accounts WHERE code = '1101'), 75000.00, 0.00, 'AR from services'),
(@je10, (SELECT id FROM accounts WHERE code = '4002'), 0.00, 75000.00, 'Service revenue');

-- Show summary
SELECT 
    '✅ SUCCESS! Data inserted (duplicates skipped)!' as message,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted,
    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
FROM journal_entries;

-- ========================================
-- 🎉 DONE! Now open Transaction Recording module:
-- http://localhost/Accounting%20and%20finance/modules/transaction-reading.php
-- ========================================

