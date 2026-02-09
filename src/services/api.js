import { supabase } from '@/lib/supabase';

export const api = {
    // Rooms
    getRooms: async () => {
        const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    checkRoomCount: async () => {
        const { count, error } = await supabase
            .from('rooms')
            .select('*', { count: 'exact', head: true });
        if (error) console.error("Count Check Error:", error);
        return { count, error };
    },

    createRoom: async (roomData) => {
        const { data, error } = await supabase.from('rooms').insert([roomData]).select();
        if (error) throw error;
        return data;
    },

    updateRoom: async (id, updates) => {
        const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select();
        if (error) throw error;
        return data;
    },

    deleteRoom: async (id) => {
        const { error } = await supabase.from('rooms').delete().eq('id', id);
        if (error) throw error;
    },

    // Bookings
    createBooking: async (bookingData) => {
        const { data, error } = await supabase.from('bookings').insert(bookingData).select();
        if (error) throw error;
        return data; // Returns array of inserted rows
    },

    expireUnpaid: async () => {
        const { error } = await supabase.rpc('expire_unpaid_bookings');
        if (error) console.error("Auto-expire failed:", error);
        // Don't throw, just log. It's a background task.
    },

    getRoomBookings: async (roomId, dateStr) => {
        // Fetch confirmed bookings for a specific room and date
        // dateStr is "YYYY-MM-DD"
        const start = `${dateStr}T00:00:00`;
        const end = `${dateStr}T23:59:59`;

        const { data, error } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('room_id', roomId)
            .eq('status', 'confirmed') // Only confirmed bookings
            .gte('start_time', start)
            .lte('start_time', end);

        if (error) throw error;
        return data;
    },

    checkAvailability: async ({ roomId, start, end }) => {
        const { data, error } = await supabase.rpc('check_availability', {
            p_room_id: roomId,
            p_start_time: start,
            p_end_time: end,
        });
        if (error) throw error;
        return data;
    },

    getUserBookings: async (userId) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name, image_url)')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });
        if (error) throw error;
        return data;
    },

    getAllBookings: async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, rooms(name), profiles(full_name, id)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    checkBookingCount: async () => {
        const { count, error } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });
        if (error) console.error("Count Check Error:", error);
        return { count, error };
    },

    // Secure Payment: Create Order (Server Side)
    createPaymentOrder: async (bookingId) => {
        // Explicitly get session to ensure token is fresh
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            console.error("No active session found in api.js");
            throw new Error("User not authenticated");
        }

        console.log("Calling create-order with Token:", token.substring(0, 10) + "...");

        const { data, error } = await supabase.functions.invoke('create-order', {
            body: { booking_id: bookingId },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (error) {
            console.error("Create Order Error Details:", error);
            // Try to extract the error message from the response body if available
            if (error instanceof Error && error.context) {
                try {
                    const body = await error.context.json();
                    console.error("Function Response Body:", body);
                    throw new Error(body.error || error.message);
                } catch (e) {
                    console.error("Failed to parse error body", e);
                }
            }
            throw error;
        }
        return data;
    },

    // Secure Payment: Verify Signature (Server Side)
    verifyPayment: async (bookingId, paymentData) => {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: {
                booking_id: bookingId,
                payment_data: paymentData
            }
        });
        if (error) throw error;
        return data;
    }
};
