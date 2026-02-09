
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Check method
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Auth Check - Explicit Token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error("Missing Authorization header");

        const token = authHeader.replace(/^Bearer\s+/i, "");

        // Debug Env Vars
        const sbUrl = Deno.env.get('SUPABASE_URL');
        const sbAnon = Deno.env.get('SUPABASE_ANON_KEY');

        if (!sbUrl || !sbAnon) {
            throw new Error("Server Config Error: Missing Env Vars");
        }

        const supabaseClient = createClient(
            sbUrl,
            sbAnon,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !user) {
            console.error("Auth Fail:", authError);
            throw new Error(`Unauthorized: ${authError?.message || 'No User'}`);
        }

        // 2. Parse Data
        const { booking_id, payment_data } = await req.json()
        const { order_id, payment_id, signature } = payment_data;

        if (!booking_id || !order_id || !payment_id || !signature) {
            throw new Error("Missing payment details");
        }

        // 3. Verify Signature (Native Crypto - No external deps)
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
        const isTestMode = !RAZORPAY_KEY_SECRET;

        if (!isTestMode) {
            const encoder = new TextEncoder();
            const message = order_id + "|" + payment_id;

            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(RAZORPAY_KEY_SECRET),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );

            const signatureBuffer = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(message)
            );

            // Convert buffer to hex string
            const generated_signature = [...new Uint8Array(signatureBuffer)]
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            if (generated_signature !== signature) {
                throw new Error("Invalid Payment Signature");
            }
        } else {
            console.log("Test Mode: Skipping signature verification");
        }

        // 4. Update Booking (Admin Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ payment_status: 'paid' })
            .eq('id', booking_id)
            .eq('user_id', user.id) // Ensure ownership
            .select()
            .single()

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, booking: updatedBooking }), {
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
