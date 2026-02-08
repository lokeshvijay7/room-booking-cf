import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

import AdminOverview from './AdminOverview';
import AdminRoomList from './AdminRoomList';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    async function fetchData() {
        setLoading(true);
        try {
            const [bookingsData, roomsData] = await Promise.all([
                api.getAllBookings(),
                api.getRooms()
            ]);

            setBookings(bookingsData || []);
            setRooms(roomsData || []);
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase();

        // Safely access properties with fallbacks
        const customerName = booking.profiles?.full_name?.toLowerCase() || '';
        const roomName = booking.rooms?.name?.toLowerCase() || '';
        const bookingId = booking.id?.toLowerCase() || '';

        const matchesSearch =
            customerName.includes(searchLower) ||
            roomName.includes(searchLower) ||
            bookingId.includes(searchLower);

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mx-auto px-6 py-10 max-w-7xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage bookings, rooms, and view reports.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </div>
            </div>

            {/* RLS/Data Debug Warning */}
            {bookings.length === 0 && (
                <div className="p-4 bg-orange-100 text-orange-800 rounded-md">
                    <strong>Debug:</strong> No bookings fetched. Check Console.
                    If you see 0 bookings here but have them in DB, it's likely an RLS issue.
                    <br />
                    Make sure your user role is 'admin' in the `profiles` table.
                </div>
            )}

            {/* Custom Tabs */}
            <div className="space-y-4">
                <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                    {['overview', 'bookings', 'rooms'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                ${activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <AdminOverview bookings={bookings} rooms={rooms} />
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>All Bookings</CardTitle>
                                    <CardDescription>
                                        A complete valid list of all user reservations.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search user or room..."
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-xs"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <select
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Customer</th>
                                            <th className="p-4 font-medium">Room</th>
                                            <th className="p-4 font-medium">Date/Time</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium">Payment</th>
                                            <th className="p-4 font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-muted-foreground">
                                                    No bookings found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBookings.map(booking => (
                                                <tr key={booking.id} className="border-t hover:bg-muted/50">
                                                    <td className="p-4">
                                                        <div className="font-medium">{booking.profiles?.full_name || 'N/A'}</div>
                                                        <div className="text-xs text-muted-foreground">{booking.profiles?.email || booking.profiles?.id.slice(0, 8)}</div>
                                                    </td>
                                                    <td className="p-4">{booking.rooms?.name}</td>
                                                    <td className="p-4">
                                                        <div>{format(new Date(booking.start_time), 'PP')}</div>
                                                        <div className="text-xs text-muted-foreground">{format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'} className="capitalize">
                                                            {booking.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className={`capitalize ${booking.payment_status === 'paid' ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}`}>
                                                            {booking.payment_status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 font-semibold">₹{booking.total_price}</td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'rooms' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <AdminRoomList rooms={rooms} onUpdate={fetchData} />
                    </div>
                )}
            </div>
        </div>
    );
}
