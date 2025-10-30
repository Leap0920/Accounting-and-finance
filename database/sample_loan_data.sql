-- Sample Loan Data for Testing Loan Accounting Module
-- Run this after running schema.sql

USE accounting_finance;

-- Insert sample loan types if not exists
INSERT IGNORE INTO loan_types (code, name, max_amount, max_term_months, interest_rate, description, is_active) VALUES
('PL', 'Personal Loan', 500000.00, 60, 12.5000, 'Personal loans for employees', TRUE),
('HL', 'Housing Loan', 2000000.00, 360, 8.5000, 'Housing/Home loans', TRUE),
('VL', 'Vehicle Loan', 1000000.00, 60, 10.0000, 'Auto/Vehicle loans', TRUE),
('EL', 'Emergency Loan', 100000.00, 12, 15.0000, 'Quick emergency loans', TRUE),
('SL', 'Salary Loan', 200000.00, 24, 14.0000, 'Salary advance loans', TRUE);

-- Insert sample employee references if not exists
INSERT IGNORE INTO employee_refs (external_employee_no, name, department, position, employment_type) VALUES
('EMP001', 'Juan Dela Cruz', 'Operations', 'Supervisor', 'regular'),
('EMP002', 'Maria Santos', 'Finance', 'Accountant', 'regular'),
('EMP003', 'Pedro Reyes', 'HR', 'HR Manager', 'regular'),
('EMP004', 'Ana Garcia', 'Sales', 'Sales Executive', 'regular'),
('EMP005', 'Jose Mendoza', 'IT', 'Developer', 'contract');

-- Insert sample loans
INSERT INTO loans (loan_no, loan_type_id, borrower_external_no, principal_amount, interest_rate, start_date, term_months, monthly_payment, current_balance, status, created_by) VALUES
('LOAN-2024-001', 1, 'EMP001', 150000.00, 12.5000, '2024-01-15', 36, 5025.00, 120000.00, 'active', 1),
('LOAN-2024-002', 2, 'EMP002', 1500000.00, 8.5000, '2024-02-01', 240, 12850.00, 1450000.00, 'active', 1),
('LOAN-2024-003', 3, 'EMP003', 500000.00, 10.0000, '2024-03-10', 60, 10625.00, 450000.00, 'active', 1),
('LOAN-2024-004', 4, 'EMP004', 50000.00, 15.0000, '2023-12-01', 12, 4500.00, 0.00, 'paid', 1),
('LOAN-2024-005', 5, 'EMP005', 100000.00, 14.0000, '2024-04-01', 24, 4850.00, 85000.00, 'active', 1),
('LOAN-2024-006', 1, 'EMP001', 75000.00, 12.5000, '2024-05-15', 24, 3575.00, 65000.00, 'active', 1),
('LOAN-2023-010', 1, 'EMP002', 100000.00, 12.5000, '2023-01-15', 36, 3350.00, 0.00, 'paid', 1),
('LOAN-2023-015', 3, 'EMP003', 350000.00, 10.0000, '2023-06-01', 60, 7437.50, 280000.00, 'active', 1),
('LOAN-2024-007', 4, 'EMP004', 25000.00, 15.0000, '2024-06-01', 12, 2250.00, 18000.00, 'active', 1),
('LOAN-2024-008', 2, 'EMP005', 800000.00, 8.5000, '2024-07-01', 180, 7960.00, 795000.00, 'pending', 1);

-- Insert sample loan payments
INSERT INTO loan_payments (loan_id, payment_date, amount, principal_amount, interest_amount, payment_reference) VALUES
-- Payments for LOAN-2024-001
(1, '2024-02-15', 5025.00, 3775.00, 1250.00, 'PAY-2024-001'),
(1, '2024-03-15', 5025.00, 3815.00, 1210.00, 'PAY-2024-002'),
(1, '2024-04-15', 5025.00, 3855.00, 1170.00, 'PAY-2024-003'),
(1, '2024-05-15', 5025.00, 3895.00, 1130.00, 'PAY-2024-004'),
(1, '2024-06-15', 5025.00, 3935.00, 1090.00, 'PAY-2024-005'),
(1, '2024-07-15', 5025.00, 3975.00, 1050.00, 'PAY-2024-006'),

-- Payments for LOAN-2024-002
(2, '2024-03-01', 12850.00, 2225.00, 10625.00, 'PAY-2024-010'),
(2, '2024-04-01', 12850.00, 2241.00, 10609.00, 'PAY-2024-011'),

-- Payments for LOAN-2024-003  
(3, '2024-04-10', 10625.00, 6458.33, 4166.67, 'PAY-2024-020'),

-- Payments for LOAN-2024-004 (fully paid)
(4, '2023-12-15', 4500.00, 3875.00, 625.00, 'PAY-2023-100'),
(4, '2024-01-15', 4500.00, 3924.00, 576.00, 'PAY-2024-101'),
(4, '2024-02-15', 4500.00, 3974.00, 526.00, 'PAY-2024-102'),
(4, '2024-03-15', 4500.00, 4024.00, 476.00, 'PAY-2024-103'),
(4, '2024-04-15', 4500.00, 4075.00, 425.00, 'PAY-2024-104'),
(4, '2024-05-15', 4500.00, 4126.00, 374.00, 'PAY-2024-105'),
(4, '2024-06-15', 4500.00, 4177.00, 323.00, 'PAY-2024-106'),
(4, '2024-07-15', 4500.00, 4229.00, 271.00, 'PAY-2024-107'),
(4, '2024-08-15', 4500.00, 4281.00, 219.00, 'PAY-2024-108'),
(4, '2024-09-15', 4500.00, 4334.00, 166.00, 'PAY-2024-109'),
(4, '2024-10-15', 4500.00, 4387.00, 113.00, 'PAY-2024-110'),
(4, '2024-11-15', 4113.00, 4050.00, 63.00, 'PAY-2024-111'),

-- Payments for LOAN-2024-005
(5, '2024-05-01', 4850.00, 3683.33, 1166.67, 'PAY-2024-200'),
(5, '2024-06-01', 4850.00, 3726.00, 1124.00, 'PAY-2024-201'),
(5, '2024-07-01', 4850.00, 3769.00, 1081.00, 'PAY-2024-202');

-- Sample compliance note:
-- The above data demonstrates:
-- 1. Active loans with varying balances
-- 2. A fully paid loan (LOAN-2024-004)
-- 3. A pending loan (LOAN-2024-008)
-- 4. Different loan types (Personal, Housing, Vehicle, Emergency, Salary)
-- 5. Realistic payment history with principal and interest calculations

