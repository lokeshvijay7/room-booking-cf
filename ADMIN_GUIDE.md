
# Admin Access Guide

## How to become an Admin
1. Open the file `make_admin.sql` in this project.
2. Replace `YOUR_EMAIL_HERE` with your signup email.
3. Run the script in your **Supabase SQL Editor**.

## How to access Admin Dashboard
1. Ensure you are logged in.
2. Go to: `http://localhost:5179/admin` (or click the Admin link if visible in navigation).
3. If you see the dashboard, you are an Admin!

## Troubleshooting
- If you see "Access Denied" or get redirected to Home, the SQL script didn't run correctly or your email is wrong.
- Verify your role in Supabase `profiles` table.
