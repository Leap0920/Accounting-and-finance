# Complete Accounting and Finance System Overview

## 🎯 Executive Summary

Your **Accounting and Finance Subsystem** is a comprehensive financial management platform that handles all monetary operations, financial reporting, and compliance for a banking/financial organization. It works as a **partner system** with the HRIS (Human Resources Information System), receiving employee data to process payroll and employee-related financial transactions.

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HRIS SUBSYSTEM (Partner System)              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Employee Master Data (Name, ID, Position, Dept)     │    │
│  │  • Attendance Records (Time-in, Time-out, Overtime)    │    │
│  │  • Leave Records (Sick, Vacation, Unpaid)              │    │
│  │  • Benefits Information (SSS, PhilHealth, Pag-IBIG)    │    │
│  │  • Salary Rates & Allowances                           │    │
│  │  • Employment Status Changes                           │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────────┘
                     │ DATA FLOW (API/Database Integration)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│         YOUR ACCOUNTING & FINANCE SUBSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │         1. PAYROLL MANAGEMENT MODULE                │        │
│  │  ✓ Receives employee data from HRIS                │        │
│  │  ✓ Calculates gross pay (salary + overtime)        │        │
│  │  ✓ Computes deductions (taxes, loans, SSS, etc)    │        │
│  │  ✓ Generates net pay                               │        │
│  │  ✓ Creates digital payslips                        │        │
│  │  ✓ Records payroll journal entries                 │        │
│  └────────────────────────────────────────────────────┘        │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │         2. GENERAL LEDGER (Core Accounting)         │        │
│  │  ✓ Chart of Accounts (Asset, Liability, Equity,    │        │
│  │    Revenue, Expense)                                │        │
│  │  ✓ Double-Entry Bookkeeping System                 │        │
│  │  ✓ Journal Entries (Debit & Credit)                │        │
│  │  ✓ Trial Balance                                    │        │
│  │  ✓ Account Balances in Real-time                   │        │
│  └────────────────────────────────────────────────────┘        │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │         3. TRANSACTION RECORDING MODULE             │        │
│  │  ✓ Income Recording (Revenue from operations)      │        │
│  │  ✓ Expense Recording (Operating costs)             │        │
│  │  ✓ Bank Transactions (Deposits, Withdrawals)       │        │
│  │  ✓ Account Transfers                               │        │
│  │  ✓ Transaction Approval Workflow                   │        │
│  └────────────────────────────────────────────────────┘        │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │         4. EXPENSE TRACKING MODULE                  │        │
│  │  ✓ Business Expense Recording                      │        │
│  │  ✓ Expense Categories (Travel, Supplies, etc)      │        │
│  │  ✓ Approval Workflow (Pending/Approved/Rejected)   │        │
│  │  ✓ Employee Reimbursements (from HRIS data)        │        │
│  │  ✓ Budget Monitoring                               │        │
│  └────────────────────────────────────────────────────┘        │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │         5. LOAN ACCOUNTING MODULE                   │        │
│  │  ✓ Loan Issuance Recording                         │        │
│  │  ✓ Loan Repayment Tracking                         │        │
│  │  ✓ Interest Calculation                            │        │
│  │  ✓ Loan Status Management                          │        │
│  │  ✓ Employee Loan Deductions (from HRIS)            │        │
│  └────────────────────────────────────────────────────┘        │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │         6. FINANCIAL REPORTING MODULE               │        │
│  │  ✓ Income Statement (Profit & Loss)                │        │
│  │  ✓ Balance Sheet (Assets = Liabilities + Equity)   │        │
│  │  ✓ Cash Flow Statement                             │        │
│  │  ✓ Trial Balance Report                            │        │
│  │  ✓ Payroll Summary Reports                         │        │
│  │  ✓ Expense Analysis Reports                        │        │
│  │  ✓ Tax Compliance Reports                          │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow: HRIS → Accounting & Finance

### Step-by-Step Integration Process

#### **STEP 1: Employee Data Sync**
```
HRIS System → Your System
─────────────────────────
Employee Record Created in HRIS
    ↓
Your system creates matching employee record in `employees` table
    ↓
Links to `users` table for system access
```

**What your system stores:**
- Employee Number
- Department
- Position
- Salary Rate
- Hire Date
- User Account Link

#### **STEP 2: Payroll Processing Cycle**
```
HRIS Attendance Data → Payroll Calculation → Financial Recording
──────────────────────────────────────────────────────────────────

1. HRIS provides:
   - Daily attendance (hours worked)
   - Overtime hours
   - Leave records (paid/unpaid)
   - Late/undertime deductions

2. Your Payroll Module calculates:
   Gross Pay = (Basic Salary) + (Overtime Pay) + (Allowances)
   
3. Deductions calculated:
   - Income Tax (based on tax brackets)
   - SSS Contribution
   - PhilHealth Contribution
   - Pag-IBIG Contribution
   - Employee Loans
   - Other deductions

4. Net Pay = Gross Pay - Total Deductions

5. Journal Entry Created:
   DR Salaries & Wages Expense    [Gross Pay]
   CR Withholding Tax Payable     [Tax Amount]
   CR SSS Payable                 [SSS Amount]
   CR PhilHealth Payable          [PhilHealth Amount]
   CR Pag-IBIG Payable            [Pag-IBIG Amount]
   CR Cash/Bank                   [Net Pay]
```

#### **STEP 3: Expense Reimbursements**
```
HRIS submits employee expense claim
    ↓
Your Expense Tracking Module receives claim
    ↓
Approval workflow (Pending → Approved/Rejected)
    ↓
If Approved: Create journal entry
    DR Employee Reimbursements (Expense)
    CR Cash/Bank
    ↓
Update employee records in HRIS
```

---

## 🎯 Complete Functions of Your Accounting & Finance System

### **1. PAYROLL MANAGEMENT**
**Purpose:** Automate employee compensation processing using HRIS data

**Key Functions:**
- ✅ Import employee data from HRIS (employee number, department, position, salary)
- ✅ Calculate gross pay based on attendance records from HRIS
- ✅ Compute government-mandated deductions (SSS, PhilHealth, Pag-IBIG)
- ✅ Calculate income tax withholding
- ✅ Process employee loans deductions
- ✅ Generate net pay
- ✅ Create digital payslips
- ✅ Record payroll transactions in General Ledger
- ✅ Generate payroll reports for management

**HRIS Dependency:**
- Employee master data (name, position, salary rate)
- Attendance records (for gross pay calculation)
- Leave records (paid/unpaid leaves)
- Loan balances (for deductions)

**Database Tables Used:**
- `employees` - Employee master records
- `payroll` - Payroll transaction records
- `users` - User account linkage

---

### **2. GENERAL LEDGER**
**Purpose:** Core accounting system using double-entry bookkeeping

**Key Functions:**
- ✅ Maintain Chart of Accounts (5 main categories: Assets, Liabilities, Equity, Revenue, Expenses)
- ✅ Record journal entries with debits and credits
- ✅ Ensure accounting equation: Assets = Liabilities + Equity
- ✅ Track account balances in real-time
- ✅ Generate trial balance
- ✅ Support for financial statement preparation

**Example Payroll Journal Entry:**
```
Date: 2025-10-15
Description: Payroll for October 1-15, 2025

DR  Salaries & Wages Expense      ₱500,000.00
    CR  Withholding Tax Payable            ₱50,000.00
    CR  SSS Payable                        ₱20,000.00
    CR  PhilHealth Payable                 ₱10,000.00
    CR  Pag-IBIG Payable                   ₱5,000.00
    CR  Cash in Bank                       ₱415,000.00
```

**Database Tables Used:**
- `ledger_accounts` - Chart of accounts
- `journal_entries` - Journal entry headers
- `journal_lines` - Individual debit/credit lines

---

### **3. TRANSACTION RECORDING**
**Purpose:** Record all financial transactions systematically

**Key Functions:**
- ✅ Income recording (revenue from banking operations)
- ✅ Expense recording (operating costs)
- ✅ Bank account transactions (deposits, withdrawals)
- ✅ Inter-account transfers
- ✅ Transaction approval workflow
- ✅ Transaction status tracking (Pending, Completed, Cancelled)
- ✅ Automatic journal entry creation

**Transaction Types:**
1. **Income** - Revenue from services, interest income, fees
2. **Expense** - Operating costs, salaries (from payroll), utilities
3. **Transfer** - Money movement between accounts
4. **Adjustment** - Corrections and adjustments

**Database Tables Used:**
- `transactions` - All financial transactions
- `accounts` - Bank accounts
- `ledger_accounts` - For journal entry creation

---

### **4. EXPENSE TRACKING**
**Purpose:** Monitor and control business expenses

**Key Functions:**
- ✅ Record business expenses by category
- ✅ Employee expense reimbursement (data from HRIS)
- ✅ Approval workflow (Pending → Approved/Rejected)
- ✅ Budget monitoring and allocation
- ✅ Expense reports by category, department, period
- ✅ Automatic journal entry creation for approved expenses

**Expense Categories:**
- Office Supplies
- Travel & Transportation
- Meals & Entertainment
- Utilities (electricity, water, internet)
- Marketing & Advertising
- Professional Services
- Equipment & Maintenance
- Employee Reimbursements (from HRIS)

**HRIS Integration:**
- Employee expense claims
- Department budget allocations
- Employee-related expenses

**Database Tables Used:**
- `expenses` - Expense records
- `users` - User who created/approved expense

---

### **5. LOAN ACCOUNTING**
**Purpose:** Track loans and lending operations

**Key Functions:**
- ✅ Record loan issuances
- ✅ Track loan repayments
- ✅ Calculate interest
- ✅ Monitor loan status (Active, Closed, Cancelled)
- ✅ Employee loan tracking (integrated with payroll for deductions)
- ✅ Loan reports and analysis

**HRIS Integration:**
- Employee loan applications
- Automatic payroll deductions
- Loan balance updates sent to HRIS

**Database Tables Used:**
- `loads` - Loan records (note: should be renamed to `loans` in production)
- `employees` - For employee loan tracking

---

### **6. FINANCIAL REPORTING**
**Purpose:** Generate comprehensive financial reports for decision-making

**Key Reports Generated:**

#### a) **Income Statement (Profit & Loss)**
```
INCOME STATEMENT
For the Period: [Start Date] to [End Date]
─────────────────────────────────────────
REVENUES
  Service Income                   ₱XXX,XXX
  Interest Income                  ₱XXX,XXX
  Total Revenue                    ₱XXX,XXX

EXPENSES
  Salaries & Wages                 ₱XXX,XXX
  Rent Expense                     ₱XXX,XXX
  Utilities Expense                ₱XXX,XXX
  Office Supplies                  ₱XXX,XXX
  Total Expenses                   ₱XXX,XXX

NET INCOME                         ₱XXX,XXX
```

#### b) **Balance Sheet**
```
BALANCE SHEET
As of: [Date]
─────────────────────────────────────────
ASSETS
  Cash and Cash Equivalents        ₱XXX,XXX
  Accounts Receivable              ₱XXX,XXX
  Fixed Assets                     ₱XXX,XXX
  Total Assets                     ₱XXX,XXX

LIABILITIES
  Accounts Payable                 ₱XXX,XXX
  Loans Payable                    ₱XXX,XXX
  Withholding Tax Payable          ₱XXX,XXX
  SSS/PhilHealth/Pag-IBIG Payable  ₱XXX,XXX
  Total Liabilities                ₱XXX,XXX

EQUITY
  Capital                          ₱XXX,XXX
  Retained Earnings                ₱XXX,XXX
  Total Equity                     ₱XXX,XXX

TOTAL LIABILITIES & EQUITY         ₱XXX,XXX
```

#### c) **Cash Flow Statement**
```
CASH FLOW STATEMENT
For the Period: [Start Date] to [End Date]
─────────────────────────────────────────
OPERATING ACTIVITIES
  Cash from operations             ₱XXX,XXX
  Cash paid for expenses           (₱XXX,XXX)
  Net cash from operations         ₱XXX,XXX

INVESTING ACTIVITIES
  Purchase of equipment            (₱XXX,XXX)
  Net cash from investing          (₱XXX,XXX)

FINANCING ACTIVITIES
  Loan proceeds                    ₱XXX,XXX
  Loan repayments                  (₱XXX,XXX)
  Net cash from financing          ₱XXX,XXX

NET INCREASE IN CASH               ₱XXX,XXX
```

#### d) **Payroll Reports** (Uses HRIS Data)
- Payroll summary by period
- Payroll by department
- Tax withholding reports
- Government remittance reports (SSS, PhilHealth, Pag-IBIG)

---

## 🔐 User Roles & Access Control

### **Admin Role**
**Full system access:**
- ✅ All financial reports
- ✅ Approve all transactions
- ✅ User management
- ✅ System configuration
- ✅ Audit trail access
- ✅ Chart of accounts management
- ✅ Process payroll

###**Finance Officer Role**
**Financial Data Management and Analysis:**
- ✅ Record and update journal entries
- ✅ Review and reconcile general ledger accounts
- ✅ Monitor accounts payable and accounts receivable
- ✅ Generate trial balance, balance sheet, and income statement
- ✅ Manage fiscal periods (open, close, adjustments)
- ✅ Handle payroll transactions from HRIS integration
- ✅ Verify financial transactions before admin approval
- ✅ Track customer financial activities linked from the Customer table
- ✅ Prepare financial statements for management review

---

## 🔄 Integration Points with HRIS

### **What HRIS Provides to Your System:**

1. **Employee Master Data**
   - Employee ID, Name, Position, Department
   - Salary rates and pay grades
   - Employment status (active, inactive, terminated)
   - Bank account information for salary deposit

2. **Time & Attendance Data**
   - Daily attendance records
   - Overtime hours
   - Late/undertime records
   - Leave applications (paid/unpaid)

3. **Benefits & Deductions**
   - Government ID numbers (SSS, PhilHealth, Pag-IBIG, TIN)
   - Benefit enrollments
   - Loan applications and balances
   - Special deductions

4. **Personnel Actions**
   - New hires (trigger new employee setup in accounting)
   - Salary increases (update payroll rates)
   - Position changes (update department allocation)
   - Terminations (process final pay)

### **What Your System Provides to HRIS:**

1. **Payroll Results**
   - Gross pay calculated
   - Net pay for disbursement
   - Payroll deductions breakdown
   - Digital payslips

2. **Financial Status**
   - Employee loan balances
   - Reimbursement status
   - Tax withholding certificates (BIR 2316)

3. **Reporting Data**
   - Labor cost by department
   - Payroll tax reports
   - Compliance reports for government agencies

---

## 🎯 How Everything Works Together: Complete Workflow

### **Example: Monthly Payroll Process**

```
┌─────────────────────────────────────────────────────────┐
│  DAY 1-15: Attendance Recording (HRIS)                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  DAY 16: HRIS sends attendance data to your system      │
│  - Employee worked hours                                │
│  - Overtime hours                                       │
│  - Leave records                                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  DAY 17: PAYROLL PROCESSING (Your System)               │
│  1. Import employee data from HRIS                      │
│  2. Calculate gross pay:                                │
│     - Basic salary (from employee master)               │
│     - Overtime pay (OT hours × rate)                    │
│     - Allowances                                        │
│  3. Calculate deductions:                               │
│     - Tax withholding                                   │
│     - SSS, PhilHealth, Pag-IBIG                        │
│     - Employee loans                                    │
│  4. Compute net pay                                     │
│  5. Generate digital payslips                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  DAY 18: FINANCIAL RECORDING (Your System)              │
│  1. Create payroll journal entry in General Ledger:     │
│     DR Salaries & Wages Expense                         │
│     CR Withholding Tax Payable                          │
│     CR SSS Payable                                      │
│     CR PhilHealth Payable                               │
│     CR Pag-IBIG Payable                                │
│     CR Cash in Bank                                     │
│  2. Update ledger account balances                      │
│  3. Record transaction in transaction log               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  DAY 19: DISBURSEMENT (Your System)                     │
│  1. Generate bank file for salary transfer              │
│  2. Process salary disbursement transaction             │
│  3. Update account balances                             │
│  4. Send confirmation to HRIS                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  DAY 20: REPORTING (Your System)                        │
│  1. Generate payroll summary report                     │
│  2. Generate government remittance reports              │
│  3. Update expense tracking (labor cost)                │
│  4. Generate financial statements including payroll     │
│  5. Send reports to management                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Key Business Processes

### **1. Revenue Recognition**
```
Customer Transaction → Your System Records:
1. Create income transaction
2. Journal Entry:
   DR Cash/Accounts Receivable
   CR Service Revenue
3. Update account balances
4. Reflect in financial reports
```

### **2. Expense Management**
```
Business Expense Incurred → Your System:
1. Record in Expense Tracking Module
2. Approval workflow (if required)
3. Create journal entry:
   DR Expense Account (by category)
   CR Cash/Accounts Payable
4. Update budgets
5. Generate expense reports
```

### **3. Payroll Processing** (HRIS-Integrated)
```
Pay Period End → HRIS → Your System:
1. Receive attendance data from HRIS
2. Calculate payroll (gross, deductions, net)
3. Create journal entry
4. Process disbursement
5. Generate reports
6. Send confirmation to HRIS
```

### **4. Loan Processing**
```
Loan Application → Your System:
1. Record loan issuance
2. Journal Entry:
   DR Loans Receivable
   CR Cash
3. Track repayments:
   DR Cash
   CR Loans Receivable
   CR Interest Income
4. Update loan status
5. Generate loan reports
```

---

## 🎯 System Objectives Achievement

Based on your documentation, here's how your system achieves the stated objectives:

### **Main Objective Achievement:**
✅ **Accurate & Efficient Payroll:** Automated calculation using HRIS data  
✅ **Real-time Integration:** Seamless data flow from HRIS  
✅ **User-friendly:** Role-based dashboards and intuitive modules  
✅ **Timely Processing:** Automated workflows reduce processing time  
✅ **Employee Satisfaction:** Accurate, transparent payroll and digital payslips  

### **Specific Objectives Achievement:**
✅ **Automate Payroll:** Done via Payroll Management Module  
✅ **Integrate Attendance:** Receives data from HRIS  
✅ **Track Financial Transactions:** Transaction Recording & General Ledger modules  
✅ **Centralized Database:** MySQL database with proper schema  
✅ **Role-based Access:** Admin, HR, Customer roles implemented  

---

## 🎓 Academic Significance

### **For Thesis/Project:**

Accounting & Finance subsystem demonstrates:

1. **System Integration:** Partnership between HRIS and Accounting systems
2. **Data Flow Management:** Proper handling of cross-system data
3. **Accounting Principles:** Implementation of double-entry bookkeeping
4. **Compliance:** Government-mandated deductions (SSS, PhilHealth, Pag-IBIG, BIR)
5. **Security:** Role-based access control and audit trails
6. **Reporting:** Comprehensive financial and management reports

### **Key Learning Points:**

1. **Why HR Data is Needed:**
   - Employee information for payroll
   - Attendance for compensation calculation
   - Personal details for tax computation
   - Department/position for cost allocation

2. **Your System's Role:**
   - Convert HR data into financial records
   - Ensure accounting accuracy
   - Generate financial reports
   - Support management decision-making
   - Ensure regulatory compliance

3. **System Dependencies:**
   - **Upstream:** HRIS provides employee and attendance data
   - **Downstream:** Your system provides financial reports to management
   - **Parallel:** Both systems maintain their own databases with integration points

---

## 🔍 Summary: Total Function of Your System

**Your Accounting & Finance Subsystem is the FINANCIAL BRAIN of the organization that:**

1. **Receives employee/personnel data from HRIS** (the partner system)
2. **Processes payroll** using that data with proper deductions and calculations
3. **Records ALL financial transactions** using double-entry bookkeeping
4. **Tracks expenses** including employee reimbursements
5. **Manages loans** for both the organization and employees
6. **Generates comprehensive financial reports** for compliance and decision-making
7. **Maintains accounting integrity** through proper journal entries and balances
8. **Ensures compliance** with government regulations (taxes, SSS, PhilHealth, Pag-IBIG)

**Bottom Line:** You take HR's people data and turn it into accurate financial records and reports, while also handling all other financial operations of the bank/organization.

---

## 📝 Database Schema Overview

-- ========================================
-- ROLES AND ACCESS CONTROL
-- ========================================

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ========================================
-- HRIS EMPLOYEE REFERENCE (Linked, not stored)
-- ========================================

CREATE TABLE employee_refs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  external_employee_no VARCHAR(100) NOT NULL, -- ID from HRIS
  name VARCHAR(200),
  department VARCHAR(100),
  position VARCHAR(100),
  employment_type ENUM('regular','contract','part-time') DEFAULT 'regular',
  external_source VARCHAR(100) DEFAULT 'HRIS',
  UNIQUE KEY (external_employee_no, external_source)
);

-- ========================================
-- ACCOUNTING CORE STRUCTURE
-- ========================================

CREATE TABLE fiscal_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (start_date, end_date)
);

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(150),
  type ENUM('asset','liability','equity','revenue','expense') NOT NULL,
  parent_account_id INT NULL,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (parent_account_id) REFERENCES accounts(id)
);

CREATE TABLE journal_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  journal_no VARCHAR(50) UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT,
  fiscal_period_id INT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('draft','posted','reversed') DEFAULT 'draft',
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id)
);

CREATE TABLE journal_lines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  journal_entry_id BIGINT NOT NULL,
  account_id INT NOT NULL,
  debit DECIMAL(18,2) DEFAULT 0.00,
  credit DECIMAL(18,2) DEFAULT 0.00,
  memo VARCHAR(255),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- ========================================
-- PAYROLL (Linked to HRIS Employees)
-- ========================================

CREATE TABLE payroll_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  frequency ENUM('monthly','semimonthly','weekly') DEFAULT 'semimonthly',
  status ENUM('open','processing','posted','paid') DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (period_start, period_end)
);

CREATE TABLE payroll_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_period_id INT NOT NULL,
  run_by_user_id INT,
  run_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_gross DECIMAL(18,2) DEFAULT 0.00,
  total_deductions DECIMAL(18,2) DEFAULT 0.00,
  total_net DECIMAL(18,2) DEFAULT 0.00,
  status ENUM('draft','finalized','exported','completed') DEFAULT 'draft',
  FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id),
  FOREIGN KEY (run_by_user_id) REFERENCES users(id)
);

CREATE TABLE payslips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payroll_run_id INT NOT NULL,
  employee_external_no VARCHAR(100) NOT NULL, -- HRIS link
  gross_pay DECIMAL(18,2) DEFAULT 0.00,
  total_deductions DECIMAL(18,2) DEFAULT 0.00,
  net_pay DECIMAL(18,2) DEFAULT 0.00,
  payslip_json JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id)
);

CREATE TABLE payslip_lines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payslip_id BIGINT NOT NULL,
  code VARCHAR(50),
  label VARCHAR(150),
  amount DECIMAL(18,2) DEFAULT 0.00,
  line_type ENUM('earning','deduction') NOT NULL,
  FOREIGN KEY (payslip_id) REFERENCES payslips(id)
);

CREATE TABLE salary_components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  type ENUM('earning','deduction','tax','employer_contrib') NOT NULL,
  calculation_method ENUM('fixed','percent','per_hour','formula') DEFAULT 'fixed',
  value DECIMAL(15,4) DEFAULT 0.00,
  description TEXT
);

-- ========================================
-- BANKING AND PAYMENT CONTROL
-- ========================================

CREATE TABLE bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  bank_name VARCHAR(150),
  account_number VARCHAR(64),
  currency VARCHAR(10) DEFAULT 'PHP',
  balance DECIMAL(18,2) DEFAULT 0.00
);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_no VARCHAR(50) UNIQUE,
  payment_date DATE NOT NULL,
  from_bank_account_id INT,
  to_reference VARCHAR(150),
  amount DECIMAL(18,2) NOT NULL,
  reference VARCHAR(150),
  status ENUM('pending','completed','failed') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_bank_account_id) REFERENCES bank_accounts(id)
);

-- ========================================
-- LOANS
-- ========================================

CREATE TABLE loans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  borrower_external_no VARCHAR(100) NULL, -- HRIS or customer ref
  loan_no VARCHAR(50) UNIQUE,
  principal DECIMAL(18,2),
  interest_rate DECIMAL(6,4),
  start_date DATE,
  term_months INT,
  balance DECIMAL(18,2) DEFAULT 0.00,
  status ENUM('active','paid','defaulted','closed') DEFAULT 'active'
);

CREATE TABLE loan_payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  loan_id BIGINT NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  applied_to_principal DECIMAL(18,2) DEFAULT 0.00,
  applied_to_interest DECIMAL(18,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- ========================================
-- EXPENSES AND RECEIPTS
-- ========================================

CREATE TABLE expense_claims (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_no VARCHAR(50) UNIQUE,
  employee_external_no VARCHAR(100) NULL, -- HRIS reference
  amount DECIMAL(18,2),
  category VARCHAR(100),
  description TEXT,
  status ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(50) UNIQUE,
  customer_name VARCHAR(150),
  amount DECIMAL(18,2),
  received_date DATE,
  account_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- ========================================
-- SYSTEM LOGS
-- ========================================

CREATE TABLE integration_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  source_system VARCHAR(100),
  endpoint VARCHAR(200),
  payload JSON,
  response JSON,
  status ENUM('success','error','pending'),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(150),
  object_type VARCHAR(100),
  object_id VARCHAR(100),
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

---

## 📞 Conclusion

Your Accounting & Finance subsystem is a **complete financial management solution** that:
- Partners with HRIS to get employee data
- Processes payroll accurately
- Records all financial transactions
- Maintains proper accounting records
- Generates comprehensive reports
- Ensures regulatory compliance

**You are NOT just doing accounting** - you're building a comprehensive system that transforms people data (from HRIS) and business transactions into meaningful financial information for decision-making.

---

*Document Created: October 11, 2025*  
*System: BankingSys - Accounting & Finance Subsystem*  
*Integration Partner: HRIS (Human Resources Information System)*

