# Room Booking System

A simplified room booking system involving bookings, payment simulation, and admin management. Built with **React + Vite** and **Supabase**.

## Features

### User Features
*   **Browse Rooms**: View multiple rooms with details, pricing, and images.
*   **Book a Room**: 
    *   Select date and time (Smart conflict detection prevents double booking).
    *   Real-time availability checking.
    *   Local timezone support (No UTC issues).
*   **Payment Simulation**: Integrated Mock Payment Gateway (Razorpay style) via secure RPC.
*   **My Bookings**: View booking history with status badges and payment receipt tracking.
*   **Auto-Expiration**: Unpaid bookings expire automatically after 24 hours.

### Admin Features
*   **Dashboard**: View key metrics (Total Bookings, Revenue).
*   **Booking Management**: 
    *   View all bookings in a sortable/filterable table.
    *   **Filter** bookings by User Name, Room Name, or Status.
*   **Room Management**: Add, Edit, or Delete rooms.
*   **Admin Route Protection**: Secure RLS policies ensure only admins can access these pages.

## Tech Stack
*   **Frontend**: React, Vite, TailwindCSS, Shadcn UI.
*   **Backend**: Supabase (PostgreSQL).
*   **Security**: Row Level Security (RLS) for data protection.
*   **Database**:
    *   **Triggers**: Prevent double bookings at the database level.
    *   **RPC Functions**: Handle complex availability logic and payment processing.

## Setup Instructions

### 1. Prerequisites
*   Node.js installed.
*   A Supabase project.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1.  Navigate to the `schema/` directory.
2.  Run `schema.sql` in your Supabase SQL Editor.
3.  Run `update_schema.sql` to add the payment processing logic.
4.  Run `seed.sql` to populate sample rooms.
5.  (Optional) Run `fix_loki_admin.sql` to make a specific user an admin.

### 4. Run Locally
```bash
npm install
npm run dev
```

## Structure
*   `/src/pages`: Main route components (Admin, Bookings, Auth).
*   `/src/components`: Reusable UI components.
*   `/src/services`: Supabase API wrapper.
*   `/schema`: SQL scripts for database setup.

## License
MIT
