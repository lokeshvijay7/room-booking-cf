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

    processPayment: async (bookingId) => {
        const { data, error } = await supabase.rpc('process_payment', {
            p_booking_id: bookingId
        });
        if (error) throw error;
        return data;
    }
};
