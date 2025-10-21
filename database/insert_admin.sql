-- ========================================
-- INSERT ADMIN USER
-- ========================================
-- This file inserts the default admin user into the system
-- Username: admin
-- Password: admin123
-- Email: admin@system.com
-- Full Name: System Administrator

USE accounting_finance;

-- Insert the admin user
-- Password hash for 'admin123' using password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO users (id, username, password_hash, email, full_name, is_active, created_at) 
VALUES (
    1,
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@system.com',
    'System Administrator',
    TRUE,
    NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('Administrator', 'Full system access with all privileges'),
('Accountant', 'Access to accounting and financial modules'),
('Payroll Officer', 'Access to payroll management'),
('Auditor', 'Read-only access to financial records');

-- Assign admin role to the admin user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Insert default account types
INSERT INTO account_types (name, category, description) VALUES
('Current Assets', 'asset', 'Assets expected to be converted to cash within one year'),
('Fixed Assets', 'asset', 'Long-term tangible assets'),
('Current Liabilities', 'liability', 'Obligations due within one year'),
('Long-term Liabilities', 'liability', 'Obligations due after one year'),
('Equity', 'equity', 'Owner\'s equity in the business'),
('Revenue', 'revenue', 'Income from business operations'),
('Operating Expenses', 'expense', 'Costs of running the business');

-- Insert default journal types
INSERT INTO journal_types (code, name, auto_reversing, description) VALUES
('GJ', 'General Journal', FALSE, 'Standard journal entries'),
('PJ', 'Payroll Journal', FALSE, 'Payroll-related entries'),
('BJ', 'Banking Journal', FALSE, 'Bank transactions'),
('AJ', 'Adjusting Journal', TRUE, 'Period-end adjustments');

-- Insert a sample fiscal period (current year)
INSERT INTO fiscal_periods (period_name, start_date, end_date, status) VALUES
(CONCAT('FY ', YEAR(CURDATE())), 
 DATE_FORMAT(CURDATE(), '%Y-01-01'), 
 DATE_FORMAT(CURDATE(), '%Y-12-31'), 
 'open');

-- Insert default loan types
INSERT INTO loan_types (code, name, max_amount, max_term_months, interest_rate, is_active) VALUES
('PL', 'Personal Loan', 100000.00, 36, 0.0500, TRUE),
('SL', 'Salary Loan', 50000.00, 24, 0.0400, TRUE),
('EL', 'Emergency Loan', 25000.00, 12, 0.0300, TRUE);

-- Success message
SELECT 'Admin user and default data inserted successfully!' AS message;

