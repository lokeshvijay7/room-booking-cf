# 🏢 Room Booking System

A modern, full-stack application for booking meeting rooms and workspaces. Built with **React**, **Supabase**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)

## ✨ Features

### 🚀 Core Functionality
*   **Room Browsing**: View available rooms with high-quality images, capacity, and amenities.
*   **Smart Booking**: Real-time availability checks with "Smart Conflict Warnings" to prevent overlaps.
*   **Secure Payments**: Integrated **Razorpay** payment gateway for instant booking confirmation.
*   **User Dashboard**: Manage booking history, view status, and download tickets.

### 🛡️ Security & Admin
*   **Role-Based Access**: Specialized Admin Panel for managing rooms and overseeing all bookings.
*   **Geolocation**: Admins can add room locations using their current GPS coordinates.
*   **Ticket System**: Automatically generates a **QR Code Ticket** for every confirmed booking.
*   **Row Level Security (RLS)**: Database-level security ensures users can only access their own data.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Shadcn UI
*   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
*   **Maps**: Leaflet (OpenStreetMap)
*   **Payments**: Razorpay
*   **Icons**: Lucide React

---

## ⚡ Getting Started

### Prerequisites
1.  Node.js (v16+)
2.  A Supabase project (Free tier works great)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/room-booking-cf.git
    cd room-booking-cf
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🚀 Deployment

The app is optimized for free deployment on **Vercel**.

1.  Push your code to **GitHub**.
2.  Import the repo into **Vercel**.
3.  Add your Environment Variables in the Vercel dashboard.
4.  Update your Supabase **Auth Redirect URLs** to match your new Vercel domain.

*See `DEPLOYMENT.md` for a detailed step-by-step guide.*

---

## 📂 Project Structure

- `src/pages`: Main application views (Home, Booking, Admin).
- `src/components`: Reusable UI components (Modals, RoomCard, Navbar).
- `src/services`: API logic for Supabase interactions.
- `schema`: Database SQL scripts for initial setup.

---

## 📄 Documentation

For a deep dive into the architecture and database schema, please refer to:
*   [Project Documentation](project_documentation.md)


---

Developed by Lokesh K V
