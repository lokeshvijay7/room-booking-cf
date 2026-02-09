# Room Booking System - Project Documentation

## 1. Project Overview
This is a modern, responsive **Room Booking Application** designed for corporate or co-working environments. It allows users to browse available meeting rooms, view details, and book them for specific time slots. It includes a robust **Admin Panel** for managing rooms and overseeing all bookings.

The project emphasizes **usability, security, and real-world functionality**, featuring "Smart Conflict Detection," "Geolocation," and "QR Code Tickets."

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Fast, modern UI library for building interactive interfaces. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid, responsive design. |
| **Components**| **Shadcn UI** | Accessible, reusable component library (based on Radix UI). |
| **Backend** | **Supabase** | Backend-as-a-Service providing Auth, Database, and Realtime capabilities. |
| **Database** | **PostgreSQL** | Robust relational database hosting the data. |
| **Payments** | **Razorpay** | Secure payment gateway integration for booking payments. |
| **Maps** | **Leaflet** | Interactive maps for showing room locations. |

---

## 3. Key Features & Workflows

### A. Authentication (Auth)
- **Library**: Supabase Auth (Email/Password).
- **Workflow**:
    - Users sign up or login.
    - Upon sign-up, a Trigger (`handle_new_user`) automatically creates a `profile` entry in the database.
    - **RLS (Row Level Security)** ensures users can only edit their own profiles, while Admins can view all.

### B. User Booking Flow
1.  **Browse**: Users view a list of rooms with details (Capacity, Amenities, Price).
    *   *New:* "Popular Destinations" section highlights key locations.
2.  **Selection**: User clicks "Book This Room" to open the booking wizard.
3.  **Conflict Check (Smart Warning)**:
    *   As the user selects a Date/Time, the app checks for existing bookings.
    *   **Logic**: If a booking exists *immediately* before or after the selected slot (within 15 mins), a "Warning" alerts the user (e.g., "Note: Another meeting starts right after you").
4.  **Payment**:
    *   Integration with **Razorpay**.
    *   Payment is processed securely. On success, the booking is marked as `paid`.
5.  **Confirmation**:
    *   Success screen shows a **QR Code Ticket** and **Location Map**.
    *   Option to **Share via Email**.

### C. My Bookings (User Dashboard)
- Users can view their booking history.
- **Pay Now Feature**: If a user booked but didn't pay (or payment failed), they can resume payment from this screen within the 10-minute reservation window.
- **Digital Asset**: Users can view/print their "Access Pass" (QR Code) at any time.

### D. Admin Panel
- **Access**: Restricted to users with `role = 'admin'` in the `profiles` table.
- **Room Management**:
    *   **Add/Edit Rooms**: Full CRUD capabilities.
    *   **Geolocation**: "Use Current Location" button fetches the admin's coordinates to pin the room on the map.
- **Booking Oversight**:
    *   View all bookings (Confirmed/Cancelled).
    *   Filter by status or search by user name.

---

## 4. Technical Deep Dive

### Row Level Security (RLS)
**Why?** To secure the database at the lowest level. Even if the frontend code is compromised, the database rejects unauthorized queries.
**Implementation**:
*   `rooms`: **Public Read** (anyone can see rooms), **Admin Write** (only admins can add/edit).
*   `bookings`: **User Read Own** (users see only their bookings), **Admin Read All**.
*   `profiles`: **User Update Own**, **Public Read** (for basic user info).

### Database Schema
*   **`rooms`**: Stores room details (`id`, `name`, `capacity`, `lat`, `lng`, etc.).
*   **`bookings`**: Links `user_id` and `room_id`. has `start_time`, `end_time`, `status` ('confirmed', 'cancelled'), `payment_status` ('pending', 'paid').
    *   *Constraint*: `end_time > start_time`.
*   **`profiles`**: Extends auth users with `full_name` and `role`.

### Unique Logic: Double Booking Prevention
We use a **PostgreSQL Trigger** (`prevent_double_booking`) that runs *before* every booking insertion.
*   It checks against *all* existing `confirmed` bookings for the same room.
*   If time ranges overlap, the database *rejects* the insert with an error.
*   This guarantees data integrity even if two users try to book the exact same millisecond.

### Unique Logic: Auto-Expiration
*   **RPC Function**: `expire_unpaid_bookings`.
*   Checks for bookings that are `pending` payment and older than 10 minutes.
*   Automatically marks them as `cancelled` to free up the slot.

---

## 5. Deployment & Testing
1.  **Run Locally**: `npm run dev`
2.  **Test User**: Login as a normal user to test booking flow.
3.  **Test Admin**: Login as admin to test adding rooms (requires database role update).
4.  **Payments**: Uses Razorpay Test Mode (no real money deducted).

---

**This project is a complete, production-ready prototype demonstrating full-stack competencies with modern tools.**
