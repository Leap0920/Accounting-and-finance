-- ========================================
-- SAMPLE JOURNAL ENTRIES FOR TESTING
-- ========================================
-- This file adds sample journal entries to test the filtering functionality
-- Run this after Sampled_data.sql to add transaction data

USE accounting_finance;

-- ========================================
-- SAMPLE JOURNAL ENTRIES
-- ========================================

-- Insert sample journal entries
INSERT INTO journal_entries (journal_type_id, entry_date, reference, description, status, created_by, created_at) VALUES
(1, '2024-01-15', 'GJ-001', 'Initial cash deposit', 'posted', 1, NOW()),
(1, '2024-01-16', 'GJ-002', 'Office supplies purchase', 'posted', 1, NOW()),
(1, '2024-01-17', 'GJ-003', 'Sales revenue', 'posted', 1, NOW()),
(1, '2024-01-18', 'GJ-004', 'Rent payment', 'posted', 1, NOW()),
(1, '2024-01-19', 'GJ-005', 'Equipment purchase', 'posted', 1, NOW()),
(1, '2024-01-20', 'GJ-006', 'Service revenue', 'posted', 1, NOW()),
(1, '2024-01-21', 'GJ-007', 'Utilities payment', 'posted', 1, NOW()),
(1, '2024-01-22', 'GJ-008', 'Accounts receivable', 'posted', 1, NOW()),
(1, '2024-01-23', 'GJ-009', 'Marketing expense', 'posted', 1, NOW()),
(1, '2024-01-24', 'GJ-010', 'Loan received', 'posted', 1, NOW()),
(1, '2024-01-25', 'GJ-011', 'Interest expense', 'posted', 1, NOW()),
(1, '2024-01-26', 'GJ-012', 'Depreciation expense', 'posted', 1, NOW()),
(1, '2024-01-27', 'GJ-013', 'Insurance payment', 'posted', 1, NOW()),
(1, '2024-01-28', 'GJ-014', 'Consulting revenue', 'posted', 1, NOW()),
(1, '2024-01-29', 'GJ-015', 'Travel expense', 'posted', 1, NOW()),
(1, '2024-01-30', 'GJ-016', 'Inventory purchase', 'posted', 1, NOW()),
(1, '2024-02-01', 'GJ-017', 'Salary expense', 'posted', 1, NOW()),
(1, '2024-02-02', 'GJ-018', 'Sales commission', 'posted', 1, NOW()),
(1, '2024-02-03', 'GJ-019', 'Bank charges', 'posted', 1, NOW()),
(1, '2024-02-04', 'GJ-020', 'Dividend income', 'posted', 1, NOW())
ON DUPLICATE KEY UPDATE reference = VALUES(reference);

-- ========================================
-- SAMPLE JOURNAL LINES
-- ========================================

-- Get account IDs for journal lines
SET @cash_account = (SELECT id FROM accounts WHERE code = '1001' LIMIT 1);
SET @ar_account = (SELECT id FROM accounts WHERE code = '1002' LIMIT 1);
SET @ap_account = (SELECT id FROM accounts WHERE code = '2001' LIMIT 1);
SET @equity_account = (SELECT id FROM accounts WHERE code = '3001' LIMIT 1);
SET @sales_account = (SELECT id FROM accounts WHERE code = '4001' LIMIT 1);
SET @supplies_account = (SELECT id FROM accounts WHERE code = '5001' LIMIT 1);
SET @rent_account = (SELECT id FROM accounts WHERE code = '5002' LIMIT 1);
SET @equipment_account = (SELECT id FROM accounts WHERE code = '1003' LIMIT 1);
SET @service_account = (SELECT id FROM accounts WHERE code = '4002' LIMIT 1);
SET @utilities_account = (SELECT id FROM accounts WHERE code = '5003' LIMIT 1);
SET @marketing_account = (SELECT id FROM accounts WHERE code = '5004' LIMIT 1);
SET @loan_account = (SELECT id FROM accounts WHERE code = '2002' LIMIT 1);
SET @interest_account = (SELECT id FROM accounts WHERE code = '5005' LIMIT 1);
SET @depreciation_account = (SELECT id FROM accounts WHERE code = '5006' LIMIT 1);
SET @insurance_account = (SELECT id FROM accounts WHERE code = '5007' LIMIT 1);
SET @consulting_account = (SELECT id FROM accounts WHERE code = '4003' LIMIT 1);
SET @travel_account = (SELECT id FROM accounts WHERE code = '5008' LIMIT 1);
SET @inventory_account = (SELECT id FROM accounts WHERE code = '1004' LIMIT 1);
SET @salary_account = (SELECT id FROM accounts WHERE code = '5009' LIMIT 1);
SET @commission_account = (SELECT id FROM accounts WHERE code = '5010' LIMIT 1);
SET @bank_charges_account = (SELECT id FROM accounts WHERE code = '5011' LIMIT 1);
SET @dividend_account = (SELECT id FROM accounts WHERE code = '4004' LIMIT 1);

-- Insert journal lines for each entry
INSERT INTO journal_lines (journal_entry_id, account_id, memo, debit, credit) VALUES
-- GJ-001: Initial cash deposit (Cash 100,000, Equity 100,000)
(1, @cash_account, 'Initial cash deposit', 100000.00, 0.00),
(1, @equity_account, 'Initial capital', 0.00, 100000.00),

-- GJ-002: Office supplies purchase (Supplies 5,000, Cash 5,000)
(2, @supplies_account, 'Office supplies purchase', 5000.00, 0.00),
(2, @cash_account, 'Cash payment for supplies', 0.00, 5000.00),

-- GJ-003: Sales revenue (Cash 25,000, Sales 25,000)
(3, @cash_account, 'Cash sales', 25000.00, 0.00),
(3, @sales_account, 'Sales revenue', 0.00, 25000.00),

-- GJ-004: Rent payment (Rent 8,000, Cash 8,000)
(4, @rent_account, 'Monthly rent payment', 8000.00, 0.00),
(4, @cash_account, 'Cash payment for rent', 0.00, 8000.00),

-- GJ-005: Equipment purchase (Equipment 50,000, Cash 50,000)
(5, @equipment_account, 'Computer equipment purchase', 50000.00, 0.00),
(5, @cash_account, 'Cash payment for equipment', 0.00, 50000.00),

-- GJ-006: Service revenue (Cash 15,000, Service Revenue 15,000)
(6, @cash_account, 'Service revenue received', 15000.00, 0.00),
(6, @service_account, 'Service revenue', 0.00, 15000.00),

-- GJ-007: Utilities payment (Utilities 2,500, Cash 2,500)
(7, @utilities_account, 'Monthly utilities', 2500.00, 0.00),
(7, @cash_account, 'Cash payment for utilities', 0.00, 2500.00),

-- GJ-008: Accounts receivable (AR 12,000, Sales 12,000)
(8, @ar_account, 'Credit sales', 12000.00, 0.00),
(8, @sales_account, 'Sales on credit', 0.00, 12000.00),

-- GJ-009: Marketing expense (Marketing 3,000, Cash 3,000)
(9, @marketing_account, 'Marketing campaign', 3000.00, 0.00),
(9, @cash_account, 'Cash payment for marketing', 0.00, 3000.00),

-- GJ-010: Loan received (Cash 75,000, Loan Payable 75,000)
(10, @cash_account, 'Loan proceeds received', 75000.00, 0.00),
(10, @loan_account, 'Short-term loan', 0.00, 75000.00),

-- GJ-011: Interest expense (Interest 1,500, Cash 1,500)
(11, @interest_account, 'Loan interest payment', 1500.00, 0.00),
(11, @cash_account, 'Cash payment for interest', 0.00, 1500.00),

-- GJ-012: Depreciation expense (Depreciation 2,000, Equipment 2,000)
(12, @depreciation_account, 'Monthly depreciation', 2000.00, 0.00),
(12, @equipment_account, 'Accumulated depreciation', 0.00, 2000.00),

-- GJ-013: Insurance payment (Insurance 1,200, Cash 1,200)
(13, @insurance_account, 'Business insurance', 1200.00, 0.00),
(13, @cash_account, 'Cash payment for insurance', 0.00, 1200.00),

-- GJ-014: Consulting revenue (Cash 8,500, Consulting 8,500)
(14, @cash_account, 'Consulting fees received', 8500.00, 0.00),
(14, @consulting_account, 'Consulting revenue', 0.00, 8500.00),

-- GJ-015: Travel expense (Travel 2,800, Cash 2,800)
(15, @travel_account, 'Business travel', 2800.00, 0.00),
(15, @cash_account, 'Cash payment for travel', 0.00, 2800.00),

-- GJ-016: Inventory purchase (Inventory 18,000, Cash 18,000)
(16, @inventory_account, 'Inventory purchase', 18000.00, 0.00),
(16, @cash_account, 'Cash payment for inventory', 0.00, 18000.00),

-- GJ-017: Salary expense (Salary 12,000, Cash 12,000)
(17, @salary_account, 'Monthly salaries', 12000.00, 0.00),
(17, @cash_account, 'Cash payment for salaries', 0.00, 12000.00),

-- GJ-018: Sales commission (Commission 1,800, Cash 1,800)
(18, @commission_account, 'Sales commission', 1800.00, 0.00),
(18, @cash_account, 'Cash payment for commission', 0.00, 1800.00),

-- GJ-019: Bank charges (Bank Charges 150, Cash 150)
(19, @bank_charges_account, 'Monthly bank charges', 150.00, 0.00),
(19, @cash_account, 'Bank service charges', 0.00, 150.00),

-- GJ-020: Dividend income (Cash 5,000, Dividend Income 5,000)
(20, @cash_account, 'Dividend received', 5000.00, 0.00),
(20, @dividend_account, 'Dividend income', 0.00, 5000.00)

ON DUPLICATE KEY UPDATE memo = VALUES(memo);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if data was inserted
SELECT 'Journal Entries' as Table_Name, COUNT(*) as Record_Count FROM journal_entries
UNION ALL
SELECT 'Journal Lines' as Table_Name, COUNT(*) as Record_Count FROM journal_lines
UNION ALL
SELECT 'Accounts' as Table_Name, COUNT(*) as Record_Count FROM accounts
UNION ALL
SELECT 'Account Types' as Table_Name, COUNT(*) as Record_Count FROM account_types;

-- Show sample of journal entries
SELECT 
    je.reference,
    je.entry_date,
    je.description,
    je.status,
    COUNT(jl.id) as line_count
FROM journal_entries je
LEFT JOIN journal_lines jl ON je.id = jl.journal_entry_id
GROUP BY je.id
ORDER BY je.entry_date DESC
LIMIT 10;
