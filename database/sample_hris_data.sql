-- ========================================
-- SAMPLE HRIS DATA FOR PAYROLL MANAGEMENT
-- ========================================

USE accounting_finance;

-- ========================================
-- EMPLOYEE REFERENCE DATA
-- ========================================

INSERT INTO employee_refs (external_employee_no, name, department, position, employment_type, external_source) VALUES
('EMP001', 'Juan Carlos Santos', 'Human Resources', 'HR Manager', 'regular', 'HRIS'),
('EMP002', 'Maria Elena Rodriguez', 'Finance', 'Senior Accountant', 'regular', 'HRIS'),
('EMP003', 'Jose Miguel Cruz', 'IT', 'Software Developer', 'regular', 'HRIS'),
('EMP004', 'Ana Patricia Lopez', 'Marketing', 'Marketing Specialist', 'regular', 'HRIS'),
('EMP005', 'Roberto Antonio Garcia', 'Operations', 'Operations Manager', 'regular', 'HRIS'),
('EMP006', 'Carmen Sofia Martinez', 'Customer Service', 'CS Representative', 'contract', 'HRIS'),
('EMP007', 'Fernando Luis Torres', 'Sales', 'Sales Executive', 'regular', 'HRIS'),
('EMP008', 'Isabella Rose Flores', 'Finance', 'Payroll Specialist', 'regular', 'HRIS'),
('EMP009', 'Miguel Angel Reyes', 'IT', 'System Administrator', 'regular', 'HRIS'),
('EMP010', 'Sofia Grace Villanueva', 'Marketing', 'Content Creator', 'part-time', 'HRIS');

-- ========================================
-- BANK ACCOUNTS
-- ========================================

INSERT INTO bank_accounts (code, name, bank_name, account_number, currency, current_balance, is_active) VALUES
('BANK001', 'Evergreen Main Account', 'BDO Unibank', '1234567890', 'PHP', 2500000.00, 1),
('BANK002', 'Evergreen Payroll Account', 'Metrobank', '9876543210', 'PHP', 500000.00, 1),
('BANK003', 'Evergreen Operations Account', 'BPI', '5555666677', 'PHP', 1000000.00, 1);

-- ========================================
-- SALARY COMPONENTS
-- ========================================

-- EARNINGS
INSERT INTO salary_components (code, name, type, calculation_method, value, description, is_active) VALUES
('BASIC', 'Basic Salary', 'earning', 'fixed', 25000.00, 'Monthly basic salary', 1),
('MEAL', 'Meal Allowance', 'earning', 'fixed', 2000.00, 'Monthly meal allowance', 1),
('COMM', 'Communication Allowance', 'earning', 'fixed', 1500.00, 'Monthly communication allowance', 1),
('RICE', 'Rice Subsidy Allowance', 'earning', 'fixed', 1000.00, 'Monthly rice subsidy', 1),
('NIGHT', 'Night Shift Pay', 'earning', 'per_hour', 50.00, 'Per hour night shift differential', 1),
('OT', 'Overtime Pay', 'earning', 'per_hour', 75.00, 'Per hour overtime rate', 1),
('WFH_WIFI', 'WFH Wifi Allowance', 'earning', 'fixed', 500.00, 'Work from home wifi allowance', 1),
('WFH_ELEC', 'WFH Electricity Subsidy', 'earning', 'fixed', 800.00, 'Work from home electricity subsidy', 1),
('BONUS', 'Performance Bonus', 'earning', 'fixed', 5000.00, 'Monthly performance bonus', 1),
('COMMISSION', 'Sales Commission', 'earning', 'percent', 2.50, '2.5% of sales', 1);

-- DEDUCTIONS
INSERT INTO salary_components (code, name, type, calculation_method, value, description, is_active) VALUES
('SSS_EMP', 'SSS Employee Contribution', 'deduction', 'percent', 4.50, 'SSS employee contribution', 1),
('PAGIBIG_EMP', 'Pag-IBIG Employee Contribution', 'deduction', 'fixed', 100.00, 'Pag-IBIG employee contribution', 1),
('PHILHEALTH_EMP', 'PhilHealth Employee Contribution', 'deduction', 'percent', 3.00, 'PhilHealth employee contribution', 1),
('WHT', 'Withholding Tax', 'deduction', 'formula', 0.00, 'BIR withholding tax', 1),
('LOAN', 'Salary Loan Deduction', 'deduction', 'fixed', 2000.00, 'Monthly salary loan payment', 1),
('ADVANCE', 'Salary Advance', 'deduction', 'fixed', 1500.00, 'Salary advance deduction', 1),
('UNIFORM', 'Uniform Deduction', 'deduction', 'fixed', 300.00, 'Uniform cost deduction', 1);

-- TAXES
INSERT INTO salary_components (code, name, type, calculation_method, value, description, is_active) VALUES
('SSS_TAX', 'SSS Employee Contributions', 'tax', 'percent', 4.50, 'SSS employee contribution', 1),
('PAGIBIG_TAX', 'Pag-IBIG (HDMF) Employee Contributions', 'tax', 'fixed', 100.00, 'Pag-IBIG employee contribution', 1),
('PHILHEALTH_TAX', 'PhilHealth Employee Contributions', 'tax', 'percent', 3.00, 'PhilHealth employee contribution', 1),
('WHT_TAX', 'Withholding Tax', 'tax', 'formula', 0.00, 'BIR withholding tax', 1);

-- EMPLOYER CONTRIBUTIONS
INSERT INTO salary_components (code, name, type, calculation_method, value, description, is_active) VALUES
('PAGIBIG_ER', 'Pag-IBIG (HDMF) Employer Contribution', 'employer_contrib', 'fixed', 100.00, 'Pag-IBIG employer contribution', 1),
('PHILHEALTH_ER', 'PhilHealth Employer Contribution', 'employer_contrib', 'percent', 3.00, 'PhilHealth employer contribution', 1),
('SSS_EC_ER', 'SSS EC ER Contribution', 'employer_contrib', 'fixed', 10.00, 'SSS EC employer contribution', 1),
('SSS_ER', 'SSS Employer Contribution', 'employer_contrib', 'percent', 8.50, 'SSS employer contribution', 1);

-- ========================================
-- EXPENSE CATEGORIES
-- ========================================

INSERT INTO expense_categories (code, name, account_id, description, is_active) VALUES
('OFFICE', 'Office Supplies', 1, 'Office supplies and materials', 1),
('TRAVEL', 'Travel & Transportation', 2, 'Business travel expenses', 1),
('MEALS', 'Meals & Entertainment', 3, 'Business meals and entertainment', 1),
('UTILITIES', 'Utilities', 4, 'Electricity, water, internet', 1),
('FACILITIES', 'Facilities', 5, 'Office rent and facilities', 1),
('TRAINING', 'Training & Development', 6, 'Employee training and development', 1),
('EQUIPMENT', 'Equipment', 7, 'Office equipment and tools', 1);

-- ========================================
-- EXPENSE CLAIMS
-- ========================================

INSERT INTO expense_claims (claim_no, employee_external_no, expense_date, category_id, amount, description, status, created_at) VALUES
('EXP001', 'EMP001', '2024-01-10', 1, 2500.00, 'Office supplies for Q1', 'approved', '2024-01-10 09:00:00'),
('EXP002', 'EMP002', '2024-01-15', 2, 1500.00, 'Client meeting transportation', 'approved', '2024-01-15 14:30:00'),
('EXP003', 'EMP003', '2024-01-20', 3, 800.00, 'Team lunch meeting', 'pending', '2024-01-20 12:00:00'),
('EXP004', 'EMP004', '2024-02-01', 4, 150.00, 'Internet bill reimbursement', 'approved', '2024-02-01 10:15:00'),
('EXP005', 'EMP005', '2024-02-05', 5, 2500.00, 'Office rent payment', 'approved', '2024-02-05 08:30:00'),
('EXP006', 'EMP006', '2024-02-10', 1, 350.00, 'Office supplies', 'rejected', '2024-02-10 16:45:00'),
('EXP007', 'EMP007', '2024-02-15', 2, 2000.00, 'Sales conference travel', 'approved', '2024-02-15 11:20:00'),
('EXP008', 'EMP008', '2024-02-20', 6, 1200.00, 'Payroll software training', 'approved', '2024-02-20 13:10:00'),
('EXP009', 'EMP009', '2024-03-01', 7, 5000.00, 'New computer equipment', 'pending', '2024-03-01 09:30:00'),
('EXP010', 'EMP010', '2024-03-05', 3, 600.00, 'Marketing team dinner', 'approved', '2024-03-05 18:00:00');

-- ========================================
-- PAYMENTS/TRANSACTIONS
-- ========================================

INSERT INTO payments (payment_no, payment_date, payment_type, from_bank_account_id, payee_name, amount, reference_no, memo, status, created_by, created_at) VALUES
('PAY001', '2024-01-10', 'bank_transfer', 2, 'Juan Carlos Santos', 25000.00, 'SAL-2024-01-001', 'January salary payment', 'completed', 1, '2024-01-10 10:00:00'),
('PAY002', '2024-01-10', 'bank_transfer', 2, 'Maria Elena Rodriguez', 28000.00, 'SAL-2024-01-002', 'January salary payment', 'completed', 1, '2024-01-10 10:00:00'),
('PAY003', '2024-01-15', 'check', 1, 'Office Supplies Inc.', 2500.00, 'CHK-2024-001', 'Office supplies payment', 'completed', 1, '2024-01-15 14:30:00'),
('PAY004', '2024-01-20', 'bank_transfer', 1, 'Jose Miguel Cruz', 30000.00, 'SAL-2024-01-003', 'January salary payment', 'completed', 1, '2024-01-20 10:00:00'),
('PAY005', '2024-02-01', 'bank_transfer', 2, 'Ana Patricia Lopez', 22000.00, 'SAL-2024-02-001', 'February salary payment', 'completed', 1, '2024-02-01 10:00:00'),
('PAY006', '2024-02-05', 'bank_transfer', 1, 'Building Management', 2500.00, 'RENT-2024-02', 'Office rent payment', 'completed', 1, '2024-02-05 08:30:00'),
('PAY007', '2024-02-10', 'bank_transfer', 2, 'Roberto Antonio Garcia', 32000.00, 'SAL-2024-02-002', 'February salary payment', 'completed', 1, '2024-02-10 10:00:00'),
('PAY008', '2024-02-15', 'bank_transfer', 1, 'Travel Agency', 2000.00, 'TRAVEL-2024-001', 'Sales conference travel', 'completed', 1, '2024-02-15 11:20:00'),
('PAY009', '2024-02-20', 'bank_transfer', 2, 'Carmen Sofia Martinez', 18000.00, 'SAL-2024-02-003', 'February salary payment', 'completed', 1, '2024-02-20 10:00:00'),
('PAY010', '2024-03-01', 'bank_transfer', 2, 'Fernando Luis Torres', 26000.00, 'SAL-2024-03-001', 'March salary payment', 'completed', 1, '2024-03-01 10:00:00');

-- ========================================
-- LOAN TYPES
-- ========================================

INSERT INTO loan_types (code, name, max_amount, max_term_months, interest_rate, description, is_active) VALUES
('SALARY', 'Salary Loan', 50000.00, 12, 0.05, 'Employee salary loan', 1),
('EMERGENCY', 'Emergency Loan', 25000.00, 6, 0.08, 'Emergency financial assistance', 1),
('HOUSING', 'Housing Loan', 500000.00, 60, 0.06, 'Housing loan assistance', 1),
('EDUCATION', 'Education Loan', 100000.00, 24, 0.04, 'Educational assistance loan', 1);

-- ========================================
-- LOANS
-- ========================================

INSERT INTO loans (loan_no, loan_type_id, borrower_external_no, principal_amount, interest_rate, start_date, term_months, monthly_payment, current_balance, status, created_by, created_at) VALUES
('LN-1001', 1, 'EMP001', 50000.00, 0.05, '2024-01-01', 12, 4500.00, 45000.00, 'active', 1, '2024-01-01 09:00:00'),
('LN-1002', 2, 'EMP003', 20000.00, 0.08, '2024-01-15', 6, 3600.00, 18000.00, 'active', 1, '2024-01-15 10:30:00'),
('LN-1003', 1, 'EMP005', 30000.00, 0.05, '2024-02-01', 12, 2700.00, 30000.00, 'active', 1, '2024-02-01 11:15:00'),
('LN-1004', 3, 'EMP007', 400000.00, 0.06, '2023-06-01', 60, 8000.00, 320000.00, 'active', 1, '2023-06-01 14:20:00'),
('LN-1005', 2, 'EMP009', 15000.00, 0.08, '2024-02-10', 6, 2700.00, 15000.00, 'active', 1, '2024-02-10 16:45:00'),
('LN-1006', 4, 'EMP002', 80000.00, 0.04, '2023-09-01', 24, 3500.00, 56000.00, 'active', 1, '2023-09-01 13:30:00'),
('LN-1007', 1, 'EMP004', 25000.00, 0.05, '2024-01-20', 12, 2250.00, 25000.00, 'paid', 1, '2024-01-20 15:10:00'),
('LN-1008', 2, 'EMP006', 10000.00, 0.08, '2024-02-15', 6, 1800.00, 10000.00, 'delinquent', 1, '2024-02-15 12:00:00');

-- ========================================
-- LOAN PAYMENTS
-- ========================================

INSERT INTO loan_payments (loan_id, payment_date, amount, principal_amount, interest_amount, payment_reference, created_at) VALUES
(1, '2024-02-01', 4500.00, 4000.00, 500.00, 'PAY-2024-02-001', '2024-02-01 10:00:00'),
(1, '2024-03-01', 4500.00, 4000.00, 500.00, 'PAY-2024-03-001', '2024-03-01 10:00:00'),
(2, '2024-02-15', 3600.00, 3000.00, 600.00, 'PAY-2024-02-002', '2024-02-15 10:00:00'),
(3, '2024-03-01', 2700.00, 2500.00, 200.00, 'PAY-2024-03-002', '2024-03-01 10:00:00'),
(4, '2024-02-01', 8000.00, 6000.00, 2000.00, 'PAY-2024-02-003', '2024-02-01 10:00:00'),
(4, '2024-03-01', 8000.00, 6000.00, 2000.00, 'PAY-2024-03-003', '2024-03-01 10:00:00'),
(5, '2024-03-10', 2700.00, 2500.00, 200.00, 'PAY-2024-03-004', '2024-03-10 10:00:00'),
(6, '2024-02-01', 3500.00, 3000.00, 500.00, 'PAY-2024-02-004', '2024-02-01 10:00:00'),
(6, '2024-03-01', 3500.00, 3000.00, 500.00, 'PAY-2024-03-005', '2024-03-01 10:00:00'),
(7, '2024-02-20', 2250.00, 2000.00, 250.00, 'PAY-2024-02-005', '2024-02-20 10:00:00');

-- ========================================
-- PAYROLL PERIODS
-- ========================================

INSERT INTO payroll_periods (period_start, period_end, frequency, status, created_at) VALUES
('2024-01-01', '2024-01-31', 'monthly', 'paid', '2024-01-01 00:00:00'),
('2024-02-01', '2024-02-29', 'monthly', 'paid', '2024-02-01 00:00:00'),
('2024-03-01', '2024-03-31', 'monthly', 'processing', '2024-03-01 00:00:00');

-- ========================================
-- PAYROLL RUNS
-- ========================================

INSERT INTO payroll_runs (payroll_period_id, run_by_user_id, run_at, total_gross, total_deductions, total_net, status, created_at) VALUES
(1, 1, '2024-01-31 18:00:00', 250000.00, 45000.00, 205000.00, 'completed', '2024-01-31 18:00:00'),
(2, 1, '2024-02-29 18:00:00', 255000.00, 46000.00, 209000.00, 'completed', '2024-02-29 18:00:00'),
(3, 1, '2024-03-15 10:00:00', 260000.00, 47000.00, 213000.00, 'draft', '2024-03-15 10:00:00');

-- ========================================
-- PAYSLIPS
-- ========================================

INSERT INTO payslips (payroll_run_id, employee_external_no, gross_pay, total_deductions, net_pay, payslip_json, created_at) VALUES
(1, 'EMP001', 25000.00, 4500.00, 20500.00, '{"basic_salary": 25000, "allowances": 2000, "deductions": 4500}', '2024-01-31 18:00:00'),
(1, 'EMP002', 28000.00, 5000.00, 23000.00, '{"basic_salary": 28000, "allowances": 2000, "deductions": 5000}', '2024-01-31 18:00:00'),
(1, 'EMP003', 30000.00, 5500.00, 24500.00, '{"basic_salary": 30000, "allowances": 2000, "deductions": 5500}', '2024-01-31 18:00:00'),
(2, 'EMP001', 25000.00, 4500.00, 20500.00, '{"basic_salary": 25000, "allowances": 2000, "deductions": 4500}', '2024-02-29 18:00:00'),
(2, 'EMP002', 28000.00, 5000.00, 23000.00, '{"basic_salary": 28000, "allowances": 2000, "deductions": 5000}', '2024-02-29 18:00:00'),
(2, 'EMP003', 30000.00, 5500.00, 24500.00, '{"basic_salary": 30000, "allowances": 2000, "deductions": 5500}', '2024-02-29 18:00:00'),
(3, 'EMP001', 25000.00, 4500.00, 20500.00, '{"basic_salary": 25000, "allowances": 2000, "deductions": 4500}', '2024-03-15 10:00:00'),
(3, 'EMP002', 28000.00, 5000.00, 23000.00, '{"basic_salary": 28000, "allowances": 2000, "deductions": 5000}', '2024-03-15 10:00:00'),
(3, 'EMP003', 30000.00, 5500.00, 24500.00, '{"basic_salary": 30000, "allowances": 2000, "deductions": 5500}', '2024-03-15 10:00:00');

-- ========================================
-- ACCOUNT TYPES (if not exists)
-- ========================================

INSERT IGNORE INTO account_types (name, category, description) VALUES
('Assets', 'asset', 'Company assets'),
('Liabilities', 'liability', 'Company liabilities'),
('Equity', 'equity', 'Company equity'),
('Revenue', 'revenue', 'Company revenue'),
('Expenses', 'expense', 'Company expenses');

-- ========================================
-- ACCOUNTS (if not exists)
-- ========================================

INSERT IGNORE INTO accounts (code, name, type_id, description, is_active, created_by) VALUES
('1000', 'Cash and Cash Equivalents', 1, 'Cash and bank accounts', 1, 1),
('2000', 'Accounts Payable', 2, 'Amounts owed to suppliers', 1, 1),
('3000', 'Owner Equity', 3, 'Owner equity accounts', 1, 1),
('4000', 'Revenue', 4, 'Company revenue', 1, 1),
('5000', 'Operating Expenses', 5, 'Operating expenses', 1, 1);

-- ========================================
-- JOURNAL TYPES (if not exists)
-- ========================================

INSERT IGNORE INTO journal_types (code, name, auto_reversing, description) VALUES
('SAL', 'Salary Journal', 0, 'Salary and payroll entries'),
('EXP', 'Expense Journal', 0, 'Expense entries'),
('PAY', 'Payment Journal', 0, 'Payment entries'),
('LOAN', 'Loan Journal', 0, 'Loan entries');

-- ========================================
-- FISCAL PERIODS (if not exists)
-- ========================================

INSERT IGNORE INTO fiscal_periods (period_name, start_date, end_date, status) VALUES
('FY 2024 Q1', '2024-01-01', '2024-03-31', 'open'),
('FY 2024 Q2', '2024-04-01', '2024-06-30', 'open'),
('FY 2024 Q3', '2024-07-01', '2024-09-30', 'open'),
('FY 2024 Q4', '2024-10-01', '2024-12-31', 'open');
