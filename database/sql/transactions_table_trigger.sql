-- ========================================
-- AUTOMATIC JOURNAL ENTRY TRIGGER FOR TRANSACTIONS TABLE
-- ========================================
-- This trigger automatically creates journal entries
-- when transactions are inserted into the 'transactions' table
-- (for backward compatibility with bank-system that uses 'transactions' table)
-- 
-- Usage: Run this SQL file in phpMyAdmin if you have a 'transactions' table
-- ========================================

USE BankingDB;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trg_transactions_to_journal_entry;

DELIMITER $$

CREATE TRIGGER trg_transactions_to_journal_entry
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_journal_no VARCHAR(50);
    DECLARE v_journal_type_id INT;
    DECLARE v_fiscal_period_id INT;
    DECLARE v_debit_account_id INT;
    DECLARE v_credit_account_id INT;
    DECLARE v_description TEXT;
    DECLARE v_transaction_date DATE;
    DECLARE v_created_by INT DEFAULT 1; -- Default to admin user (ID 1)
    DECLARE v_entry_id BIGINT;
    DECLARE v_type_name VARCHAR(50);
    
    -- Get transaction date
    SET v_transaction_date = DATE(NEW.created_at);
    
    -- Get current open fiscal period
    SELECT id INTO v_fiscal_period_id 
    FROM fiscal_periods 
    WHERE status = 'open' 
    ORDER BY start_date DESC 
    LIMIT 1;
    
    -- Default to first period if none open
    IF v_fiscal_period_id IS NULL THEN
        SELECT id INTO v_fiscal_period_id FROM fiscal_periods ORDER BY id LIMIT 1;
    END IF;
    
    -- Get journal type (Cash Receipt or Cash Disbursement)
    SELECT id INTO v_journal_type_id 
    FROM journal_types 
    WHERE code = 'CR' 
    LIMIT 1;
    
    -- Default to General Journal if CR not found
    IF v_journal_type_id IS NULL THEN
        SELECT id INTO v_journal_type_id 
        FROM journal_types 
        WHERE code = 'GJ' 
        LIMIT 1;
    END IF;
    
    -- Generate journal entry number
    SET v_journal_no = CONCAT('JE-TXN-', DATE_FORMAT(NEW.created_at, '%Y%m%d'), '-', LPAD(NEW.transaction_id, 4, '0'));
    
    -- Get transaction type name
    SELECT type_name INTO v_type_name 
    FROM transaction_types 
    WHERE transaction_type_id = NEW.transaction_type_id 
    LIMIT 1;
    
    -- Build description
    SET v_description = CONCAT('Bank Transaction: ', 
        COALESCE(v_type_name, 'Unknown Type'),
        ' - ', 
        COALESCE(NEW.description, 'No description'));
    
    -- Map transaction types to accounts
    -- Based on bank-system transaction types:
    -- Type 1: Deposit
    -- Type 2: Withdrawal
    -- Type 3: Transfer Out
    -- Type 4: Transfer In
    -- Type 5: Interest Payment
    -- Type 6: Loan Payment
    -- Type 7: Fee
    
    CASE NEW.transaction_type_id
        WHEN 1 THEN -- Deposit
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '2601' LIMIT 1; -- Deferred Revenue
                IF v_credit_account_id IS NULL THEN
                    SELECT id INTO v_credit_account_id FROM accounts WHERE code = '5001' LIMIT 1; -- Sales Revenue
                END IF;
            END
        WHEN 2 THEN -- Withdrawal
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '2601' LIMIT 1; -- Deferred Revenue
                IF v_debit_account_id IS NULL THEN
                    SELECT id INTO v_debit_account_id FROM accounts WHERE code = '6001' LIMIT 1; -- Cost of Goods Sold
                END IF;
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
            END
        WHEN 3 THEN -- Transfer Out
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
            END
        WHEN 4 THEN -- Transfer In
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
            END
        WHEN 5 THEN -- Interest Payment
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '5101' LIMIT 1; -- Interest Income
            END
        WHEN 6 THEN -- Loan Payment
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1102' LIMIT 1; -- Accounts Receivable - Other (Loans)
            END
        WHEN 7 THEN -- Fee
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '8002' LIMIT 1; -- Bank Charges
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
            END
        ELSE -- Default
            BEGIN
                SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1002' LIMIT 1; -- Cash in Bank
                SELECT id INTO v_credit_account_id FROM accounts WHERE code = '5001' LIMIT 1; -- Sales Revenue
            END
    END CASE;
    
    -- Only create journal entry if accounts are found
    IF v_debit_account_id IS NOT NULL AND v_credit_account_id IS NOT NULL THEN
        -- Insert journal entry
        INSERT INTO journal_entries (
            journal_no,
            journal_type_id,
            entry_date,
            description,
            fiscal_period_id,
            reference_no,
            total_debit,
            total_credit,
            status,
            created_by,
            posted_by,
            posted_at
        ) VALUES (
            v_journal_no,
            v_journal_type_id,
            v_transaction_date,
            v_description,
            v_fiscal_period_id,
            COALESCE(NEW.transaction_ref, CONCAT('TXN-', NEW.transaction_id)),
            NEW.amount,
            NEW.amount,
            'posted',
            v_created_by,
            v_created_by,
            NOW()
        );
        
        -- Get the inserted journal entry ID
        SET v_entry_id = LAST_INSERT_ID();
        
        -- Insert debit line
        INSERT INTO journal_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            memo
        ) VALUES (
            v_entry_id,
            v_debit_account_id,
            NEW.amount,
            0.00,
            CONCAT('Bank Transaction: ', COALESCE(NEW.description, 'No description'))
        );
        
        -- Insert credit line
        INSERT INTO journal_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            memo
        ) VALUES (
            v_entry_id,
            v_credit_account_id,
            0.00,
            NEW.amount,
            CONCAT('Bank Transaction: ', COALESCE(NEW.description, 'No description'))
        );
    END IF;
    
END$$

DELIMITER ;

-- ========================================
-- VERIFICATION
-- ========================================
-- Test the trigger by checking if it exists:
-- SHOW TRIGGERS LIKE 'trg_transactions_to_journal_entry';

-- Note: This trigger only works if you have a 'transactions' table
-- If you only use 'bank_transactions', use bank_transaction_trigger.sql instead

