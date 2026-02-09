import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Box, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import BookingTicket from '@/components/bookings/BookingTicket';
import LocationMap from '@/components/ui/LocationMap';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

// internal component for countdown
const BookingTimer = ({ createdAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!createdAt) return;

            const created = new Date(createdAt).getTime();
            const now = new Date().getTime();
            // 15 minutes expiration
            const EXPIRATION_MS = 15 * 60 * 1000;
            const expiresAt = created + EXPIRATION_MS;

            let difference = expiresAt - now;

            // CLAMPING: If difference is mysteriously larger than 15 mins (e.g. clock skew), 
            // cap it at 15 mins so user doesn't see "57 minutes".
            if (difference > EXPIRATION_MS) {
                difference = EXPIRATION_MS;
            }

            if (difference > 0) {
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            } else {
                setTimeLeft('0:00');
                setIsExpired(true);
                if (onExpire) onExpire();
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // initial call

        return () => clearInterval(timer);
    }, [createdAt, onExpire]);

    if (isExpired) {
        return <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Booking Expired</span>;
    }

    return (
        <span className="text-amber-700 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" />
            Pay within {timeLeft}
        </span>
    );
};

export default function BookingHistory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) return;

        async function fetchBookings() {
            try {
                // Auto-expire old pending bookings on load to ensure status is fresh
                await api.expireUnpaid();

                const data = await api.getUserBookings(user.id);
                setBookings(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, [user]);

    // 1. Separate "Pending Payment" bookings (Action Required)
    const pendingBookings = bookings.filter(b =>
        b.status === 'confirmed' && b.payment_status === 'pending'
    );

    // 2. Filter the rest based on user selection
    const historyBookings = bookings.filter(b => {
        // Exclude pending payments from the main history list to avoid duplication,
        // UNLESS the user explicitly asks for "Pay Now" filter.
        if (filter !== 'pay_now' && b.status === 'confirmed' && b.payment_status === 'pending') {
            return false;
        }

        const now = new Date();
        const start = new Date(b.start_time);

        if (filter === 'all') return true;

        if (filter === 'upcoming') {
            return b.status === 'confirmed' && start >= now;
        }

        if (filter === 'pay_now') {
            return b.status === 'confirmed' && b.payment_status === 'pending';
        }

        if (filter === 'completed') {
            return b.status === 'confirmed' && start < now;
        }

        if (filter === 'cancelled') {
            return b.status === 'cancelled';
        }
        return true;
    }).sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const handlePayment = async (booking) => {
        if (!booking) return;
        setProcessingId(booking.id);

        try {
            // STEP 1: Securely Create Order
            console.log("Creating order for booking:", booking.id);
            const order = await api.createPaymentOrder(booking.id);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Room Booking System",
                description: `Payment for ${booking.rooms?.name}`,
                image: "https://example.com/your_logo",
                order_id: order.id, // Server Order ID

                // STEP 2: Verify Signature
                handler: async function (response) {
                    console.log("Razorpay success:", response);
                    try {
                        toast({
                            title: "Processing Payment...",
                            description: "Verifying secure signature...",
                        });

                        await api.verifyPayment(booking.id, {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        // Reload bookings
                        const data = await api.getUserBookings(user.id);
                        setBookings(data || []);

                        toast({
                            title: "Payment Successful!",
                            description: "Your booking is now fully paid.",
                            className: "bg-green-600 text-white border-none",
                        });
                    } catch (e) {
                        console.error("Verification Failed", e);
                        toast({
                            variant: "destructive",
                            title: "Verification Failed",
                            description: "Payment succeeded but server verification failed.",
                        });
                    } finally {
                        setProcessingId(null);
                    }
                },
                prefill: {
                    name: user?.user_metadata?.full_name || user?.email,
                    email: user?.email,
                },
                theme: {
                    color: "#2563eb"
                },
                modal: {
                    ondismiss: function () {
                        toast({ description: "Payment cancelled." });
                        setProcessingId(null);
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast({
                    variant: "destructive",
                    title: "Payment Failed",
                    description: response.error.description || "The payment could not be processed.",
                });
                setProcessingId(null);
            });
            rzp1.open();

        } catch (err) {
            console.error("Payment Initiation Error:", err);
            toast({
                variant: "destructive",
                title: "System Error",
                description: "Failed to initiate payment. Check your connection.",
            });
            setProcessingId(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Bookings</h1>
                    <p className="text-slate-500 mt-1">Manage your reservations.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Bookings</option>
                        <option value="pay_now">Pay Now (Action Required)</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {/* SECTION 1: ACTION REQUIRED (Pending Payments) */}
                {pendingBookings.length > 0 && filter === 'all' && (
                    <div className="space-y-4 mb-8">
                        <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6" /> Action Required
                        </h2>
                        {pendingBookings.map((booking) => (
                            <Card
                                key={booking.id}
                                className="overflow-hidden shadow-md border-amber-400 ring-1 ring-amber-400 bg-amber-50/20 group"
                            >
                                <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{booking.rooms?.name}</h3>
                                            <p className="text-sm text-slate-500 mb-2">
                                                {format(new Date(booking.start_time), 'EEE, MMM d')} • {formatPrice(booking.total_price)}
                                            </p>

                                            <BookingTimer createdAt={booking.created_at} />
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-amber-500 hover:bg-amber-600 text-white gap-2 w-full sm:w-auto shadow-sm"
                                        onClick={() => handlePayment(booking)}
                                        disabled={processingId === booking.id}
                                    >
                                        {processingId === booking.id ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Pay Now & Confirm</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* SECTION 2: BOOKING HISTORY */}
                <div className="space-y-6">
                    {historyBookings.length === 0 && pendingBookings.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm">
                                <Box className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                No bookings match your current filter.
                            </p>
                            <Link to="/">
                                <Button size="lg" className="font-semibold">
                                    Browse Rooms
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        historyBookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all border-slate-200 group">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Image Section */}
                                    <div className="sm:w-48 h-48 sm:h-auto relative bg-slate-100 shrink-0">
                                        {booking.rooms?.image_url ? (
                                            <img
                                                src={booking.rooms.image_url}
                                                alt={booking.rooms.name}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : null}
                                        <div className="flex items-center justify-center h-full text-slate-400 absolute inset-0 bg-slate-100" style={{ display: booking.rooms?.image_url ? 'none' : 'flex' }}>
                                            <Box className="w-8 h-8 opacity-20" />
                                        </div>
                                        <div className="absolute top-2 left-2 sm:hidden">
                                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                                                {booking.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                                                        {booking.rooms?.name || 'Unknown Room'}
                                                    </h3>
                                                    <Badge variant={booking.status === 'confirmed' ? 'secondary' : 'outline'} className="hidden sm:inline-flex capitalize">
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span>{format(new Date(booking.start_time), 'EEE, MMM d, yyyy')}</span>
                                                    </div>
                                                    <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        <span>
                                                            {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-lg font-bold text-slate-900">
                                                    {formatPrice(booking.total_price)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                            {booking.payment_status === 'paid' ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Paid via Secure Payment
                                                </div>
                                            ) : booking.status === 'confirmed' ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                                    onClick={() => handlePayment(booking)}
                                                    disabled={processingId === booking.id}
                                                >
                                                    {processingId === booking.id ? (
                                                        <>Processing...</>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="w-4 h-4" /> Pay Now
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                    {booking.payment_status}
                                                </Badge>
                                            )}

                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                                                    <>
                                                        <BookingTicket booking={booking} room={booking.rooms} user={user} />

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="icon" title="View Location">
                                                                    <MapPin className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Room Location</DialogTitle>
                                                                    <DialogDescription>
                                                                        Map view of {booking.rooms?.name}
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="mt-4">
                                                                    <LocationMap
                                                                        lat={booking.rooms?.latitude}
                                                                        lng={booking.rooms?.longitude}
                                                                        roomName={booking.rooms?.name}
                                                                    />
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}
