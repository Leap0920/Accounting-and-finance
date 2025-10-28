# 📊 Expense Tracking Module - Setup Guide

## Overview
The Expense Tracking module allows you to monitor and manage all business expenses with advanced filtering, reporting, and audit trail capabilities.

## Features Implemented ✅

### 1. **Expense History Display**
- Beautiful, responsive table showing all expense records
- Displays: Transaction number, date, employee, category, account, amount, status, and description
- Color-coded status badges (Draft, Submitted, Approved, Rejected, Paid)

### 2. **Advanced Filtering System**
- **Date Range Filter**: Filter by date from and date to
- **Transaction Type Filter**: Filter by expense type
- **Status Filter**: Filter by expense status
- **Account Number Filter**: Filter by account code
- Collapsible filter panel for clean UI

### 3. **Export & Print Functionality**
- **Export to CSV**: Download expense data with current filters applied
- **Print Report**: Professional print layout
- Maintains filter context during export

### 4. **Audit Trail**
- Individual expense audit history
- General module activity log
- Shows user, timestamp, changes, and IP address
- Beautiful timeline view

### 5. **Modern UI/UX**
- Consistent with Evergreen system theme
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Interactive hover effects
- Modal dialogs for details

## Installation Steps

### Step 1: Database Setup

1. **Ensure Main Schema is Installed**
   ```bash
   # Navigate to your XAMPP MySQL
   # Run the main schema.sql if not already done
   ```

2. **Run the Setup Script**
   - Open your browser and navigate to:
   ```
   http://localhost/Accounting%20and%20finance/database/setup_expense_tracking.php
   ```
   
   This script will:
   - Check if required tables exist
   - Create expense accounts (EXP-001 to EXP-005)
   - Create expense categories (Travel, Meals, Office, Communication, Training)
   - Add sample expense data for testing

### Step 2: Verify Installation

1. Access the module at:
   ```
   http://localhost/Accounting%20and%20finance/modules/expense-tracking.php
   ```

2. You should see:
   - Filter section at the top (collapsible)
   - Expense history table with sample data
   - Export and Print buttons
   - Working filter functionality

### Step 3: Test Functionality

1. **Test Filters**
   - Click "Filter Options" to expand filters
   - Select a date range
   - Choose a status
   - Click "Apply Filters"

2. **Test Export**
   - Click "Export Excel" button
   - A CSV file should download with current data

3. **Test Print**
   - Click "Print Report" button
   - Print preview should open with clean layout

4. **Test View Details**
   - Click the eye icon (👁️) on any expense row
   - Modal should open with full expense details

5. **Test Audit Trail**
   - Click the history icon on any expense row
   - Modal should show audit trail for that expense
   - Or click "Audit Trail" button at top for general audit log

## File Structure

```
Accounting and finance/
├── modules/
│   ├── expense-tracking.php          # Main module file
│   └── api/
│       └── expense-data.php          # API endpoints
├── assets/
│   ├── css/
│   │   └── expense-tracking.css      # Module styles
│   └── js/
│       └── expense-tracking.js       # Interactive functionality
└── database/
    ├── setup_expense_tracking.php    # Setup script
    └── sample_expense_data.sql       # Sample data (optional)
```

## Database Schema

### Tables Used:
- **expense_claims**: Stores expense claim records
- **expense_categories**: Categorizes expenses
- **accounts**: Links expenses to accounting accounts
- **audit_logs**: Tracks all changes and activities
- **users**: User information for creators/approvers

### Sample Accounts Created:
- **EXP-001**: Travel Expenses
- **EXP-002**: Meals & Entertainment
- **EXP-003**: Office Supplies
- **EXP-004**: Communication Expenses
- **EXP-005**: Training & Development

## Troubleshooting

### Issue: "Fatal error: Call to a member function execute() on bool"

**Solution**: Run the setup script first:
```
http://localhost/Accounting%20and%20finance/database/setup_expense_tracking.php
```

This error occurs when the required tables or accounts don't exist yet.

### Issue: No data showing in the table

**Possible Causes**:
1. No expense records in database
2. Filters are too restrictive
3. Database connection issue

**Solutions**:
1. Run setup script to add sample data
2. Click "Clear Filters" to reset filters
3. Check database connection in `config/database.php`

### Issue: Export not working

**Solution**: Check that the API file exists:
```
modules/api/expense-data.php
```

Also verify file permissions allow downloads.

### Issue: Modal not opening

**Solution**: 
1. Check browser console for JavaScript errors
2. Verify Font Awesome is loading (for icons)
3. Clear browser cache

## API Endpoints

The module uses the following API endpoints:

### 1. Get Expense Details
```
GET /modules/api/expense-data.php?action=get_expense_details&expense_id={id}
```

### 2. Get Audit Trail
```
GET /modules/api/expense-data.php?action=get_audit_trail&expense_id={id}
GET /modules/api/expense-data.php?action=get_audit_trail&general=true
```

### 3. Export Expenses
```
GET /modules/api/expense-data.php?action=export_expenses&[filter_params]
```

## Customization

### Adding New Expense Categories

1. Add account to `accounts` table:
```sql
INSERT INTO accounts (code, name, type_id, description, is_active, created_by)
VALUES ('EXP-006', 'New Category', {expense_type_id}, 'Description', 1, 1);
```

2. Add category to `expense_categories` table:
```sql
INSERT INTO expense_categories (code, name, account_id, description, is_active)
VALUES ('NEWCAT', 'New Category', {account_id}, 'Description', 1);
```

### Modifying Colors

Edit `assets/css/expense-tracking.css`:
- Primary color: `#0A3D3D` (Dark teal)
- Accent color: `#C17817` (Gold)
- Background: `#F5F1E8` (Cream)

### Adding Custom Filters

1. Update PHP query in `modules/expense-tracking.php`
2. Add filter field to HTML form
3. Update JavaScript if needed

## Security Features

- ✅ SQL injection protection (prepared statements)
- ✅ XSS prevention (htmlspecialchars)
- ✅ Session management (requireLogin)
- ✅ User authentication required
- ✅ Audit logging for all actions

## Performance Considerations

- Indexed database queries
- Efficient SQL with proper JOINs
- Lazy loading for modals
- Optimized CSS/JS (no heavy libraries)
- Pagination recommended for large datasets (future enhancement)

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Future Enhancements

Potential additions:
- [ ] Pagination for large datasets
- [ ] Advanced search functionality
- [ ] Bulk operations (approve multiple, export selected)
- [ ] Email notifications for approvals
- [ ] Document attachments (receipts, invoices)
- [ ] Custom report builder
- [ ] Excel export (XLSX format)
- [ ] Charts and analytics dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check PHP error log
4. Verify database schema is correct

## Credits

Created as part of the Evergreen Accounting & Finance System
Follows flowchart requirements for complete expense tracking workflow.



