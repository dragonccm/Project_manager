# Share Management System - User Guide

## 🎯 Quick Start Guide

### Accessing the Share Management Dashboard

1. **Start Your Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001` (or 3000 if available)

2. **Navigate to Admin Panel**
   - Open your browser
   - Go to: `http://localhost:3001/admin/share-management`
   - You'll see the Share Management dashboard

---

## 📊 Dashboard Overview

### Statistics Cards
At the top of the page, you'll see three cards:

1. **Total Shares** - Total number of share links created
2. **Active Shares** - Number of currently active/enabled shares
3. **Inactive Shares** - Number of disabled shares

### Filter Section
Use these filters to find specific shares:

#### 🔍 Search Box
- Search by:
  - Token (the unique identifier)
  - Resource name
  - Resource ID
- Type your search term and results update automatically

#### 📁 Resource Type Filter
Filter by the type of shared content:
- **All Types** - Show everything
- **Task** - Only task shares
- **Note** - Only note shares
- **Account** - Only account shares
- **Project** - Only project shares
- **Report** - Only report shares

#### 📊 Status Filter
Filter by active status:
- **All Statuses** - Show all shares
- **Active** - Only enabled shares
- **Inactive** - Only disabled shares

---

## 📋 Share Table

### Column Information

| Column | Description |
|--------|-------------|
| **Resource Type** | Colored badge showing the type (Task/Note/Account/Project/Report) |
| **Token** | First 8 characters of the unique share token |
| **Views** | Number of times the share has been accessed + last access time |
| **Created** | When the share link was created |
| **Expires** | Expiration date (or "Never" if no expiry) |
| **Status** | Active (green) or Inactive (red) badge |
| **Actions** | Buttons to manage the share |

---

## ⚡ Available Actions

### 1. 📋 Copy Link
**Button:** Copy icon
**Function:** Copies the full share URL to your clipboard
**Usage:**
1. Click the copy icon
2. Share URL is copied
3. Toast notification confirms "Link copied"

### 2. 🔗 Open Link
**Button:** External link icon
**Function:** Opens the share in a new browser tab
**Usage:**
1. Click the external link icon
2. Share page opens in new tab
3. You can preview what others will see

### 3. 📅 Update Expiry
**Button:** Calendar icon
**Function:** Change when the share link expires
**Usage:**
1. Click the calendar icon
2. Dialog opens showing current expiry
3. Select new date and time (or leave empty for "never expire")
4. Click "Update"
5. Toast confirms "Expiry date updated successfully"

**Important Notes:**
- New expiry date must be in the future
- Leave empty to make link never expire
- Cannot set date in the past

### 4. 🔌 Enable/Disable
**Button:** Power icon (green when active, red when inactive)
**Function:** Toggle share between active and disabled
**Usage:**
1. Click the power icon
2. Status toggles immediately
3. Toast confirms "Share status updated successfully"

**What Happens:**
- **Disable (red)**: Users get 403 error when accessing
- **Enable (green)**: Users can access the share again
- Link is not deleted, can be re-enabled later

### 5. 🗑️ Delete
**Button:** Trash icon
**Function:** Permanently delete the share link
**Usage:**
1. Click the trash icon
2. Confirmation dialog appears
3. Click "Delete" to confirm
4. Share is permanently removed
5. Toast confirms "Share deleted successfully"

**Warning:** This action cannot be undone!

---

## 📄 Pagination

At the bottom of the table:

### Information Display
Shows: "Showing 1 - 20 of 100"
- Current range of items displayed
- Total number of shares

### Navigation Buttons
- **Previous** - Go to previous page (disabled on first page)
- **Next** - Go to next page (disabled on last page)

---

## 🌐 Language Support

The entire interface supports two languages:
- **English** - Default
- **Vietnamese** - Full translation

To switch languages:
1. Use the language selector in your app's main navigation
2. All text updates automatically

---

## 💡 Common Use Cases

### Case 1: Finding a Specific Share
**Scenario:** You need to find a share for a specific project

**Steps:**
1. Select "Project" from Resource Type filter
2. Type the project name in the search box
3. Results filter automatically
4. Find your share in the table

### Case 2: Temporarily Disabling Access
**Scenario:** You need to temporarily stop access to a share

**Steps:**
1. Find the share in the table
2. Click the power icon (it should be green/active)
3. Share is now disabled (red badge)
4. Users get "Share link has been disabled" error
5. When ready, click power icon again to re-enable

### Case 3: Extending Expiry Date
**Scenario:** A share is about to expire but you still need it

**Steps:**
1. Find the share that's expiring soon
2. Click the calendar icon
3. Select a new future date
4. Click "Update"
5. Expiry date is extended

### Case 4: Cleaning Up Old Shares
**Scenario:** You want to remove all inactive old shares

**Steps:**
1. Select "Inactive" from Status filter
2. Review the list of disabled shares
3. Click trash icon on shares you want to delete
4. Confirm deletion
5. Shares are permanently removed

### Case 5: Checking Share Analytics
**Scenario:** You want to see how many people accessed a share

**Steps:**
1. Find the share in the table
2. Look at the "Views" column
3. See total view count
4. See when it was last accessed

---

## 🔧 API Integration

If you want to integrate programmatically:

### List All Shares
```javascript
const response = await fetch('/api/share?page=1&limit=20')
const data = await response.json()
console.log(data.data) // Array of shares
console.log(data.pagination) // Pagination info
```

### Filter Active Project Shares
```javascript
const response = await fetch('/api/share?resourceType=project&isActive=true')
const data = await response.json()
```

### Update Expiry Date
```javascript
const response = await fetch('/api/share', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shareId: 'mongodb_id_here',
    expiresAt: '2025-12-31T23:59:59Z' // or null for never
  })
})
```

### Toggle Active Status
```javascript
const response = await fetch('/api/share', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shareId: 'mongodb_id_here'
  })
})
```

### Delete Share
```javascript
const response = await fetch(`/api/share/${token}`, {
  method: 'DELETE'
})
```

---

## 🎨 Color Coding

### Resource Type Badges
- 🔵 **Blue** - Tasks
- 🟢 **Green** - Notes
- 🟣 **Purple** - Accounts
- 🟠 **Orange** - Projects
- 🌸 **Pink** - Reports

### Status Badges
- 🟢 **Green** - Active/Enabled
- 🔴 **Red** - Inactive/Disabled

---

## ❓ Troubleshooting

### Problem: "No shares found"
**Solution:** 
- Clear all filters
- Check if you have created any shares
- Try refreshing the page

### Problem: Cannot update expiry date
**Solution:**
- Make sure selected date is in the future
- Check your internet connection
- Verify you have proper permissions

### Problem: Share still accessible after disabling
**Solution:**
- Check the status badge shows "Inactive"
- Clear browser cache
- Verify the correct share was disabled

### Problem: Pagination not working
**Solution:**
- Wait for page to load completely
- Check browser console for errors
- Refresh the page

---

## 🔐 Security Notes

1. **IP Tracking**: The system tracks IP addresses for analytics
2. **View History**: Last 100 views are stored with metadata
3. **Soft Delete**: Disabling a share doesn't delete it - it can be re-enabled
4. **Hard Delete**: Deleting permanently removes all data

---

## 📞 Support

For technical issues or feature requests:
1. Check the implementation documentation: `SHARE_MANAGEMENT_IMPLEMENTATION.md`
2. Review the code in `app/admin/share-management/page.tsx`
3. Contact your development team

---

## ✨ Tips & Tricks

1. **Keyboard Shortcuts**: Use Tab to navigate between filters
2. **Quick Search**: Search box updates as you type
3. **Multi-Filter**: Combine filters for precise results
4. **Bulk Review**: Use pagination to review large numbers of shares
5. **Regular Cleanup**: Periodically delete old inactive shares

---

**Last Updated:** October 7, 2025
**Version:** 1.0.0
