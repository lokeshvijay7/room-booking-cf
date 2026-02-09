# Deployment Guide: How to Host for Free

This guide explains how to deploy your **Room Booking Application** to the internet using **Vercel** (for the frontend) and your existing **Supabase** project (for the backend). Both offer generous free tiers.

## Prerequisites
1.  A [GitHub](https://github.com/) account.
2.  A [Vercel](https://vercel.com/) account (you can sign up using GitHub).
3.  Your **Supabase** project credentials (URL and Anon Key).

---

## Step 1: Push Code to GitHub
You need to get your local code into a GitHub repository.

1.  **Initialize Git** (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit - Room Booking App"
    ```
2.  **Create a New Repository** on GitHub:
    - Go to GitHub -> New Repository.
    - Name it (e.g., `room-booking-app`).
    - Keep it **Public** (easier for free hosting) or Private.
3.  **Push Code**:
    - Copy the commands shown by GitHub (under "…or push an existing repository from the command line").
    - Example:
      ```bash
      git remote add origin https://github.com/YOUR_USERNAME/room-booking-app.git
      git branch -M main
      git push -u origin main
      ```

---

## Step 2: Deploy to Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**:
    - Find your `room-booking-app` repo in the list and click **"Import"**.
4.  **Configure Project**:
    - **Framework Preset**: Vercel usually detects `Vite` automatically. If not, select **Vite**.
    - **Root Directory**: `./` (default).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).
5.  **Environment Variables** (Crucial Step!):
    - Expand the **"Environment Variables"** section.
    - Add the variables from your local `.env` file one by one:
        *   `VITE_SUPABASE_URL`: (Your Supabase URL)
        *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
        *   `VITE_RAZORPAY_KEY_ID`: (Your Razorpay Key ID)
6.  Click **"Deploy"**.

Vercel will now build your project. It normally takes 1-2 minutes. Once finished, you will get a live URL (e.g., `https://room-booking-app-xyz.vercel.app`).

---

## Step 3: Configure Supabase
Now that your frontend has a live domain, you need to tell Supabase securely to trust it.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project -> **Authentication** -> **URL Configuration**.
3.  **Site URL**: Change this to your new Vercel URL (e.g., `https://room-booking-app-xyz.vercel.app`).
4.  **Redirect URLs**: Add your Vercel URL here as well.
    - `https://room-booking-app-xyz.vercel.app/**`
5.  Click **Save**.

---

## Step 4: Verification
1.  Open your Vercel URL in a browser.
2.  Try to **Login/Sign Up**. (If Supabase redirect settings are wrong, this is where it might fail).
3.  Try to **Book a Room**.

## Troubleshooting
- **White Screen?**: Check the browser console (F12). If you see 404 errors for assets, ensure the "Build Command" was correct (`npm run build`).
- **Login fails?**: Double-check Step 3 (Supabase URL Configuration).
- **Styles missing?**: Ensure `tailwind` was built correctly (Vercel handles this automatically if `package.json` has the scripts).
