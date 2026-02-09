import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import Razorpay from "npm:razorpay@2.9.2";

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Parse body once
        const body = await req.json();
        const { booking_id } = body;

        // 1. Auth Check - Explicit Token
        const authHeader = req.headers.get('Authorization');

        // Debug Env Vars
        const sbUrl = Deno.env.get('SUPABASE_URL');
        const sbAnon = Deno.env.get('SUPABASE_ANON_KEY');

        if (!sbUrl || !sbAnon) {
            throw new Error("Server Configuration Error: Missing Supabase Env Vars");
        }

        if (!authHeader) throw new Error("Missing Authorization header");

        const supabaseClient = createClient(
            sbUrl,
            sbAnon,
            {
                global: { headers: { Authorization: authHeader } },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        )

        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !user) {
            throw new Error(`Unauthorized: ${authError?.message || 'No User'}`);
        }

        if (!booking_id) throw new Error("Booking ID is required");

        // 3. Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        )

        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*, rooms(price_per_hour)')
            .eq('id', booking_id)
            .single()

        if (fetchError || !booking) {
            throw new Error(`Booking not found: ${fetchError?.message}`);
        }

        if (booking.user_id !== user.id) throw new Error("Unauthorized access to booking");

        // 4. Initialize Razorpay
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

        // Check if we are in test mode (missing keys)
        const isTestMode = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

        // 5. Calculate Amount (Server Side)
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const amount = Math.ceil(booking.rooms.price_per_hour * durationHours * 100); // Paise

        let order;
        if (isTestMode) {
            order = {
                id: `order_mock_${crypto.randomUUID().split('-')[0]}`,
                amount: amount,
                currency: "INR",
                status: "created"
            };
        } else {
            const razorpay = new Razorpay({
                key_id: RAZORPAY_KEY_ID,
                key_secret: RAZORPAY_KEY_SECRET,
            });

            order = await razorpay.orders.create({
                amount: amount,
                currency: "INR",
                receipt: booking.id,
                notes: { booking_id: booking.id, user_id: user.id }
            });
        }

        // 6. Return Order
        return new Response(JSON.stringify(order), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
