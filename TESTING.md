# Manual Testing Guide

Follow these steps to manually verify the application features.

## 1. User Flow

### Registration & Login
1.  Click **Sign Up**. Create a new account.
2.  You should be redirected to the Home page.
3.  Click **Log Out** and try **Sign In** with the same credentials.

### Viewing Rooms
1.  On the Home page, scroll down to see the Room Grid.
2.  Verify images, prices, and descriptions are visible.

### Booking a Room
1.  Click **Book This Room** on any room.
2.  **Select Date**: Pick "Today". Verify time slots in the past are hidden.
3.  **Select Time**: Choose a time (e.g., 2:00 PM).
4.  **Duration**: Select 1 Hour.
5.  Click **Proceed to Pay**.
6.  You will see a "Secure Payment" screen.
7.  Click **Pay Now**.
8.  Wait 2 seconds -> See Green Success Message -> Page Reloads.

### Verifying Booking
1.  Go to **My Bookings** (via User Menu).
2.  Verify the new booking appears with "Confirmed" and "Paid" status.
3.  Verify the image loads correctly (or shows a fallback icon).

## 2. Conflict Handling (Safety Check)
1.  Open the app in two different tabs (or browsers).
2.  In **Tab A**, book "Boardroom A" for Tomorrow at 10:00 AM.
3.  In **Tab B**, try to book "Boardroom A" for Tomorrow at 10:00 AM.
4.  **Expectation**: The system should show an error: "This time is already booked" or "Double booking detected".

## 3. Admin Flow

### Accessing Admin
1.  Log in with an Admin account (Role must be 'admin' in `profiles` table).
2.  Click the **User Menu** -> **Admin Dashboard**.
3.  *Note: If you don't see the link, you are not an admin. Run the `make_admin.sql` script.*

### Dashboard Features
1.  **Overview**: Check if "Total Bookings" count matches reality.
2.  **All Bookings**:
    *   Scroll down to the table.
    *   **Search**: Type a name (e.g., "John") -> Table should filter.
    *   **Filter Status**: Select "Confirmed" -> Table should show only confirmed.
3.  **Manage Rooms**:
    *   Go to "Manage Rooms" tab.
    *   Click **Add New Room**. Fill details. Save.
    *   Verify the new room appears on the Home page.

## 4. Technical Verification
*   **RLS**: Open Supabase Table Editor. Verify you cannot edit other users' bookings.
*   **Timezone**: Verify that a booking made for 10 AM appears as 10 AM in the database (or correct UTC equivalent) and displays as 10 AM in the dashboard.
