# Accounting & Finance System

A comprehensive PHP-based accounting and finance management system designed for banking and financial organizations. This system integrates with HRIS (Human Resources Information System) to process payroll and manage all financial operations.

## 🚀 Features

### Core Modules
- **User Authentication & Role Management** - Admin role with full system access
- **Payroll Management** - Automated payroll processing with HRIS integration
- **General Ledger** - Double-entry bookkeeping system
- **Transaction Recording** - Complete financial transaction management
- **Expense Tracking** - Business expense claims and reimbursements
- **Financial Reporting** - Income Statement, Balance Sheet, Cash Flow Statement
- **Chart of Accounts** - Comprehensive account management

### Key Capabilities
- ✅ Modern, responsive UI with Bootstrap 5
- ✅ Role-based access control
- ✅ Real-time financial calculations
- ✅ Automated journal entry generation
- ✅ Comprehensive audit trails
- ✅ Export functionality for reports
- ✅ Mobile-friendly design

## 📋 Requirements

- **PHP** 7.4 or higher
- **MySQL** 5.7 or higher
- **XAMPP** (recommended for local development)
- **Web Server** (Apache/Nginx)

## 🛠️ Installation

### 1. Clone/Download the Project
```bash
# Place the project in your XAMPP htdocs directory
C:\xampp\htdocs\Accounting and finance\
```

### 2. Database Setup
1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `accounting_finance`
4. Run the database initialization script:
   ```
   http://localhost/Accounting and finance/database/init.php
   ```

### 3. Configuration
The database configuration is already set up in `config/database.php` for XAMPP default settings:
- Host: localhost
- Database: accounting_finance
- Username: root
- Password: (empty)

### 4. Access the System
Open your browser and navigate to:
```
http://localhost/Accounting and finance/
```

## 👥 Demo Accounts

### Administrator
- **Email:** admin@system.com
- **Password:** admin123
- **Access:** Full system access, user management, all modules

## 📁 Project Structure

```
Accounting and finance/
├── assets/
│   ├── css/
│   │   ├── main.css          # Main application styles
│   │   └── login.css         # Login page styles
│   ├── js/
│   │   ├── main.js           # Main application JavaScript
│   │   └── login.js          # Login page JavaScript
│   └── images/               # Image assets
├── config/
│   └── database.php          # Database configuration
├── database/
│   ├── schema.sql            # Database schema
│   └── init.php              # Database initialization
├── includes/
│   └── auth.php              # Authentication system
├── modules/
│   ├── payroll/
│   │   └── payroll.php       # Payroll management
│   ├── ledger/
│   │   └── ledger.php        # General ledger
│   ├── expenses/
│   │   └── expenses.php      # Expense tracking
│   └── reports/
│       └── reports.php       # Financial reports
├── admin/
│   └── dashboard.php         # Admin dashboard
├── accounting/
│   └── dashboard.php         # Accounting officer dashboard
├── index.php                 # Login page
├── logout.php                # Logout handler
├── unauthorized.php          # Access denied page
└── README.md                 # This file
```

## 🔧 System Architecture

### Database Schema
The system uses a comprehensive MySQL database with the following key tables:
- `users` - User accounts and authentication
- `roles` - User roles and permissions
- `accounts` - Chart of accounts
- `journal_entries` - Journal entry headers
- `journal_lines` - Individual debit/credit lines
- `payroll_runs` - Payroll processing runs
- `payslips` - Individual employee payslips
- `expense_claims` - Business expense claims
- `loans` - Loan management
- `audit_logs` - System audit trail

### Key Features

#### 1. Payroll Management
- Automated payroll calculation
- Integration with HRIS employee data
- Government-mandated deductions (SSS, PhilHealth, Pag-IBIG)
- Digital payslip generation
- Journal entry automation

#### 2. General Ledger
- Double-entry bookkeeping system
- Real-time account balances
- Trial balance generation
- Chart of accounts management

#### 3. Financial Reporting
- Income Statement (Profit & Loss)
- Balance Sheet
- Cash Flow Statement
- Payroll Summary Reports
- Expense Analysis Reports

#### 4. Expense Tracking
- Employee expense claims
- Approval workflow
- Category-based tracking
- Automatic journal entry creation

## 🎨 UI/UX Features

### Modern Design
- Clean, professional interface
- Responsive design for all devices
- Bootstrap 5 framework
- Custom CSS with modern animations
- Font Awesome icons

### User Experience
- Intuitive navigation
- Real-time form validation
- Loading states and feedback
- Search and filter functionality
- Export capabilities

## 🔐 Security Features

- Password hashing with PHP password_hash()
- SQL injection prevention with prepared statements
- XSS protection with htmlspecialchars()
- Session management
- Role-based access control
- Audit logging

## 📊 Reporting Capabilities

### Financial Reports
1. **Income Statement** - Revenue and expense analysis
2. **Balance Sheet** - Assets, liabilities, and equity
3. **Cash Flow Statement** - Cash flow analysis
4. **Trial Balance** - Account balance verification

### Management Reports
1. **Payroll Summary** - Payroll cost analysis
2. **Expense Analysis** - Expense category breakdown
3. **Employee Reports** - Individual employee financial data

## 🚀 Getting Started

### For Administrators
1. Log in with admin credentials
2. Configure chart of accounts
3. Set up payroll periods
4. Review system settings
5. Manage all financial operations

## 🔄 HRIS Integration

The system is designed to integrate with HRIS systems for:
- Employee master data synchronization
- Attendance and time tracking
- Leave management
- Benefits administration
- Salary and position updates

## 📱 Mobile Support

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🛠️ Development

### Adding New Features
1. Create new modules in the `modules/` directory
2. Follow the existing code structure and patterns
3. Update the database schema if needed
4. Add appropriate role-based access controls

### Customization
- Modify CSS in `assets/css/` for styling changes
- Update JavaScript in `assets/js/` for functionality
- Extend modules for additional features

## 📞 Support

For technical support or questions:
1. Check the system documentation
2. Review the code comments
3. Check the audit logs for system activity
4. Contact your system administrator

## 🔄 Updates and Maintenance

### Regular Maintenance
- Monitor system logs
- Update user passwords regularly
- Backup database regularly
- Review and update chart of accounts
- Process payroll on schedule

### System Updates
- Keep PHP and MySQL updated
- Monitor security updates
- Test new features before deployment
- Maintain backup procedures

## 📄 License

This project is developed for educational and business purposes. Please ensure compliance with your organization's policies and local regulations.

---

**System Version:** 1.0.0  
**Last Updated:** January 2025  
**Compatible with:** PHP 7.4+, MySQL 5.7+, XAMPP 3.3+
