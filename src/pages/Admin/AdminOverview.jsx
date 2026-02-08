import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, Users, Home, TrendingUp, Calendar, Clock } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminOverview({ bookings, rooms }) {
    // 1. Calculate Core Stats
    const totalRevenue = (bookings || [])
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.total_price), 0);

    const totalBookings = bookings.length;
    const activeRooms = rooms.length;
    const confirmedRate = totalBookings > 0
        ? Math.round((bookings.filter(b => b.status === 'confirmed').length / totalBookings) * 100)
        : 0;

    // 2. Today's Schedule
    const todaysBookings = bookings
        .filter(b => b.status === 'confirmed' && isToday(new Date(b.start_time)))
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // 3. Upcoming (Next 5)
    const upcomingBookings = bookings
        .filter(b => b.status === 'confirmed' && isFuture(new Date(b.start_time)))
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 5);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">From paid bookings</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
                        <Home className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRooms}</div>
                        <p className="text-xs text-muted-foreground">Available for booking</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{confirmedRate}%</div>
                        <p className="text-xs text-muted-foreground">Bookings confirmed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Today's Schedule */}
                <Card className="md:col-span-4 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Today's Schedule
                        </CardTitle>
                        <CardDescription>
                            {todaysBookings.length === 0
                                ? "No bookings scheduled for today."
                                : `You have ${todaysBookings.length} bookings today.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todaysBookings.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No activity for today.
                                </div>
                            ) : (
                                todaysBookings.map(booking => (
                                    <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <Clock className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}</p>
                                                <p className="text-xs text-muted-foreground">{booking.rooms?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{booking.profiles?.full_name}</p>
                                            <Badge variant={booking.payment_status === 'paid' ? 'outline' : 'secondary'} className="text-[10px] h-5">
                                                {booking.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Activity */}
                <Card className="md:col-span-3 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                        <CardDescription>Next confirmed bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingBookings.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No upcoming bookings.
                                </div>
                            ) : (
                                upcomingBookings.map(booking => (
                                    <div key={booking.id} className="flex items-start justify-between gap-2 border-l-2 border-primary/20 pl-4 py-1">
                                        <div>
                                            <p className="text-sm font-medium date-text">
                                                {format(new Date(booking.start_time), 'MMM d, h:mm a')}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {booking.profiles?.full_name} • {booking.rooms?.name}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
