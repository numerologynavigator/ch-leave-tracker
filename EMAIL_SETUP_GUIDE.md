# Email Integration Setup Guide

Follow these steps to enable automatic PTO email syncing from Outlook.

## Prerequisites
- Microsoft 365 account (work or school account)
- Admin access to Azure portal (or ask your IT admin to do this)
- The email account you want to monitor for PTO requests

---

## Step 1: Go to Azure Portal

1. Open your browser and go to: **https://portal.azure.com**
2. Sign in with your Microsoft 365 admin account
3. If you don't have admin access, ask your IT administrator to help with these steps

---

## Step 2: Register a New Application

1. In the Azure Portal search bar at the top, type: **Azure Active Directory**
2. Click on **Azure Active Directory** from the results
3. In the left menu, click **App registrations**
4. Click **+ New registration** button at the top

---

## Step 3: Configure the Application

Fill in the registration form:

**Name:** 
```
Leave Tracker Email Sync
```

**Supported account types:** 
- Select: **Accounts in this organizational directory only (Single tenant)**

**Redirect URI:**
- Leave this blank (not needed for this app)

Click **Register** button at the bottom

---

## Step 4: Copy Your Application IDs

After registration, you'll see the app overview page:

1. **Copy Application (client) ID**
   - You'll see a field called "Application (client) ID"
   - It looks like: `12345678-1234-1234-1234-123456789abc`
   - Copy this - you'll need it for your .env file

2. **Copy Directory (tenant) ID**
   - You'll see a field called "Directory (tenant) ID"
   - It looks like: `87654321-4321-4321-4321-cba987654321`
   - Copy this - you'll need it for your .env file

---

## Step 5: Create a Client Secret

1. In the left menu, click **Certificates & secrets**
2. Click **+ New client secret**
3. Add a description: `Leave Tracker Secret`
4. Set expiration: **24 months** (or your preference)
5. Click **Add**

**IMPORTANT:** 
- You'll see the secret VALUE appear (looks like: `abc123~XYZ456...`)
- **Copy this immediately!** It will only show once
- If you close the page without copying, you'll need to create a new secret

---

## Step 6: Set API Permissions

1. In the left menu, click **API permissions**
2. Click **+ Add a permission**
3. Click **Microsoft Graph**
4. Click **Application permissions** (NOT Delegated)
5. Search for and add these permissions:
   - Type "Mail" and check: **Mail.Read**
   - Type "User" and check: **User.Read.All**
6. Click **Add permissions** button

7. **IMPORTANT:** Click **Grant admin consent for [Your Organization]**
   - Click **Yes** to confirm
   - You should see green checkmarks next to the permissions

---

## Step 7: Update Your .env File

1. Open your `.env` file in the Leave Tracker folder
2. Add or update these lines with your copied values:

```env
# Microsoft Graph API Configuration
MICROSOFT_CLIENT_ID=your-application-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-value-here
MICROSOFT_TENANT_ID=your-directory-tenant-id-here
MONITORED_EMAIL=your-email@company.com
```

**Example:**
```env
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=abc123~XYZ456.secretValueHere
MICROSOFT_TENANT_ID=87654321-4321-4321-4321-cba987654321
MONITORED_EMAIL=anaid@deloitte.com
```

3. Save the `.env` file

---

## Step 8: Restart the Application

1. Stop the running application (Ctrl+C in the terminal)
2. Start it again:
```powershell
npm run dev
```

---

## Step 9: Test the Email Sync

1. Make sure you have an employee added with their email address
2. Go to the **Email Sync** page in the app
3. Click **Sync Now**
4. You should see a success message!

---

## Troubleshooting

### Error: "Credentials not configured"
- Double-check your .env file has all 4 values filled in
- Make sure there are no extra spaces
- Restart the server after editing .env

### Error: "Unauthorized" or "Access denied"
- Make sure you clicked "Grant admin consent" in Step 6
- The green checkmarks should appear next to the permissions
- Wait a few minutes and try again

### Error: "Tenant not found"
- Verify your TENANT_ID is correct
- It should be the "Directory (tenant) ID" from the app overview

### No emails are being synced
- Check that employees are added with their correct email addresses
- Make sure the MONITORED_EMAIL matches the inbox you want to read
- Verify emails have keywords like "PTO", "leave", or "vacation" in the subject

---

## Need Help?

If you get stuck at any step:
1. Check the server console logs for specific error messages
2. Verify all three IDs are copied correctly
3. Make sure admin consent was granted
4. Try creating a new client secret if the old one isn't working

---

## Security Notes

- Never share your client secret publicly
- The .env file is in .gitignore so it won't be committed to git
- Client secrets expire - set a calendar reminder to renew
- Only grant the minimum permissions needed (Mail.Read and User.Read.All)
