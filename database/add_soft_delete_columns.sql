-- ========================================
-- ADD SOFT DELETE COLUMNS TO JOURNAL_ENTRIES
-- ========================================

USE accounting_finance;

-- Add soft delete columns to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN deleted_at DATETIME NULL,
ADD COLUMN deleted_by INT NULL,
ADD COLUMN restored_at DATETIME NULL,
ADD COLUMN restored_by INT NULL,
ADD FOREIGN KEY (deleted_by) REFERENCES users(id),
ADD FOREIGN KEY (restored_by) REFERENCES users(id);

-- Update the status enum to include 'deleted'
ALTER TABLE journal_entries 
MODIFY COLUMN status ENUM('draft','posted','reversed','voided','deleted') DEFAULT 'draft';

-- Add indexes for better performance
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_deleted_at ON journal_entries(deleted_at);
CREATE INDEX idx_journal_entries_deleted_by ON journal_entries(deleted_by);

-- Show the updated table structure
DESCRIBE journal_entries;
