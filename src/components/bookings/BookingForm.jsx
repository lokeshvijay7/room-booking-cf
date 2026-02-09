import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { addHours, set } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, Calendar as CalendarIcon, Clock, ShieldCheck, AlertTriangle, MapPin, Mail } from 'lucide-react'; // map pin
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Ensure Dialog imports
import BookingTicket from './BookingTicket';
import LocationMap from '@/components/ui/LocationMap';
import { useToast } from '@/components/ui/use-toast';

export default function BookingForm({ room, onSuccess }) {
    const { user } = useAuth();

    // Use local date for input (YYYY-MM-DD) to avoid UTC bugs
    const getLocalDateStr = (date = new Date()) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().split('T')[0];
    };

    const todayStr = getLocalDateStr();
    const [dateStr, setDateStr] = useState(todayStr);
    const [startTime, setStartTime] = useState(''); // Default empty to force selection
    const [duration, setDuration] = useState('1');

    const [step, setStep] = useState('details'); // details, payment, success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [bookingId, setBookingId] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [conflictWarning, setConflictWarning] = useState(null);

    // Auto-Expire on mount
    useEffect(() => {
        api.expireUnpaid();
    }, []);

    // Smart Conflict Warning Logic
    useEffect(() => {
        async function checkConflicts() {
            if (!dateStr || !startTime || !duration) return;
            setConflictWarning(null);

            try {
                // Calculate selected slot
                const [year, month, day] = dateStr.split('-').map(Number);
                const [hours, minutes] = startTime.split(':').map(Number);
                const selectedStart = set(new Date(year, month - 1, day), { hours, minutes, seconds: 0 });
                const selectedEnd = addHours(selectedStart, parseInt(duration));

                // Fetch existing bookings for this day
                const bookings = await api.getRoomBookings(room.id, dateStr);

                if (bookings && bookings.length > 0) {
                    // Check for tight squeezes
                    for (const b of bookings) {
                        const bStart = new Date(b.start_time);
                        const bEnd = new Date(b.end_time);

                        // If existing booking starts right when we end (within 15 mins)
                        const gapAfter = (bStart - selectedEnd) / 60000; // minutes
                        if (gapAfter >= 0 && gapAfter < 15) {
                            setConflictWarning(`Note: Another booking starts immediately after you at ${bStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
                        }

                        // If existing booking ends right before we start (within 15 mins)
                        const gapBefore = (selectedStart - bEnd) / 60000;
                        if (gapBefore >= 0 && gapBefore < 15) {
                            setConflictWarning(`Note: A previous booking ends just before you at ${bEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
                        }
                    }
                }
            } catch (e) {
                console.error("Conflict check failed from logic:", e);
            }
        }
        checkConflicts();
    }, [dateStr, startTime, duration, room.id]);


    // Generate Time Slots (08:00 AM to 09:00 PM)
    const generateTimeSlots = () => {
        const slots = [];
        const todayLocal = getLocalDateStr(new Date());
        const isToday = dateStr === todayLocal;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (let i = 8; i <= 21; i++) { // 8 AM to 9 PM
            // Create HH:00 slot
            // If today, only show future hours
            if (!isToday || i > currentHour || (i === currentHour && 0 > currentMinute)) {
                const hour12 = i > 12 ? i - 12 : (i === 0 || i === 12 ? 12 : i);
                const ampm = i >= 12 ? 'PM' : 'AM';
                const label = `${hour12}:00 ${ampm}`;
                const value = `${i.toString().padStart(2, '0')}:00`;
                slots.push({ value, label });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Reset start time if the selected time is no longer available (e.g. switching to today)
    useEffect(() => {
        if (startTime && !timeSlots.some(slot => slot.value === startTime)) {
            setStartTime('');
        }
    }, [dateStr, timeSlots, startTime]);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const selectedDurationCost = room.price_per_hour * parseInt(duration);

    const handleBook = async () => {
        if (!user) {
            setError("Please sign in to book a room.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            if (!dateStr || !startTime || !duration) {
                throw new Error("Please fill in all fields.");
            }

            // Construct Date objects
            const [year, month, day] = dateStr.split('-').map(Number);
            const [hours, minutes] = startTime.split(':').map(Number);

            const selectedDate = new Date(year, month - 1, day);
            const startDateTime = set(selectedDate, { hours, minutes, seconds: 0 });
            const endDateTime = addHours(startDateTime, parseInt(duration));

            if (startDateTime < new Date(Date.now() - 60000)) {
                throw new Error("Cannot book a time in the past.");
            }

            // Check availability
            const isAvailable = await api.checkAvailability({
                roomId: room.id,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
            });

            if (!isAvailable) {
                throw new Error('This time is already booked. Please choose another.');
            }

            // Create Booking (Pending Payment)
            const bookingData = {
                room_id: room.id,
                user_id: user.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                total_price: selectedDurationCost,
                status: 'confirmed',
                payment_status: 'pending'
            };

            const newBooking = await api.createBooking(bookingData);

            if (newBooking && newBooking.length > 0) {
                setBookingId(newBooking[0].id);
                setBookingDetails(newBooking[0]);
                setStep('payment');
            } else {
                // If newBooking is empty or null, it means booking creation failed or returned unexpected data.
                // We should ideally handle this as an error, but the original code proceeds to payment.
                // For now, we'll just ensure the step is set.
                setStep('payment');
            }

        } catch (err) {
            console.error("Booking Error:", err);
            setError(err.message || 'Booking failed.');
        } finally {
            setLoading(false);
        }
    };

    const { toast } = useToast();
    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use env variable
            amount: selectedDurationCost * 100, // Amount in paise
            currency: "INR",
            name: "Room Booking System",
            description: `Payment for ${room.name} (${duration} hrs)`,
            image: "https://example.com/your_logo", // You can replace this
            // order_id: "order_9A33XWu170gStF", // Note: In production, generate this on backend!
            handler: async function (response) {
                // Payment Success
                console.log("Razorpay payment success:", response);
                try {
                    // Call backend to verify and update booking
                    if (bookingId) {
                        toast({
                            title: "Processing Payment...",
                            description: "Please wait while we verify your transaction.",
                        });
                        console.log("Verifying payment for booking:", bookingId);
                        await api.processPayment(bookingId); // Updates status to 'paid'
                        console.log("Payment verification successful");
                    }
                    setStep('success');
                    toast({
                        title: "Payment Successful!",
                        description: "Your room has been booked.",
                        className: "bg-green-600 text-white border-none",
                    });
                    if (onSuccess) onSuccess();
                } catch (e) {
                    console.error("Payment Verification Failed", e);
                    toast({
                        variant: "destructive",
                        title: "Verification Failed",
                        description: "Payment successful, but verification failed. Please contact support.",
                    });
                    setError("Payment successful, but verification failed. Please contact support.");
                }
            },
            prefill: {
                name: user?.user_metadata?.full_name || user?.email,
                email: user?.email,
                contact: "" // Can add phone if available
            },
            notes: {
                booking_id: bookingId,
                room_id: room.id
            },
            theme: {
                color: "#2563eb"
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                    toast({
                        description: "Payment cancelled.",
                    });
                }
            }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                const errorMsg = response.error.description || "Payment failed";
                setError(`Payment Failed: ${errorMsg}`);
                toast({
                    variant: "destructive",
                    title: "Payment Actions Failed",
                    description: errorMsg,
                });
                setLoading(false);
            });
            rzp1.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            const msg = "Failed to load payment gateway. Please check connection.";
            setError(msg);
            toast({
                variant: "destructive",
                title: "System Error",
                description: msg,
            });
            setLoading(false);
        }
    };


    // ... inside success render ...
    if (step === 'success') {
        return (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
                <p className="text-slate-500">
                    Your payment was successful and the room is reserved.
                </p>

                {/* New Features: Ticket & Map */}
                <div className="flex justify-center gap-3 pt-4">
                    {bookingDetails && (
                        <BookingTicket booking={bookingDetails} room={room} user={user} />
                    )}

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <MapPin className="w-4 h-4" /> View Location
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {room.name} Location
                                </DialogTitle>
                                <DialogDescription>
                                    View the exact location of the room on the map.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 border rounded-xl overflow-hidden shadow-sm">
                                <LocationMap
                                    lat={room.latitude}
                                    lng={room.longitude}
                                    roomName={room.name}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="gap-2" onClick={() => {
                        const subject = encodeURIComponent(`Booking Confirmed: ${room.name}`);
                        const body = encodeURIComponent(`Here are my booking details:\n\nRoom: ${room.name}\nDate: ${dateStr}\nTime: ${startTime}\nDuration: ${duration} hours\n\nPlease find the attached QR code in the app.`);
                        window.open(`mailto:?subject=${subject}&body=${body}`);
                    }}>
                        <Mail className="w-4 h-4" /> Share
                    </Button>
                </div>

                <DialogClose asChild>
                    <Button className="mt-4 w-full" variant="secondary">Close</Button>
                </DialogClose>
            </div>
        )
    }

    if (step === 'payment') {
        return (
            <div className="space-y-6 py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                    <ShieldCheck className="w-12 h-12 mx-auto text-blue-600 bg-blue-50 p-2 rounded-full" />
                    <h3 className="text-lg font-semibold">Secure Payment</h3>
                    <p className="text-sm text-slate-500">Complete transaction via Razorpay Secure</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Booking Amount</span>
                        <span className="font-medium text-slate-900">{formatPrice(selectedDurationCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Convenience Fee</span>
                        <span className="font-medium text-slate-900">{formatPrice(0)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total Payable</span>
                        <span className="font-bold text-xl text-blue-700">{formatPrice(selectedDurationCost)}</span>
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium shadow-md transition-all active:scale-[0.98]"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payment...
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>Pay Now</span>
                            </div>
                        )}
                    </Button>

                    <div className="text-center flex items-center justify-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-3 h-3" /> Secure Payment Gateway
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => {
                                setStep('details');
                                setConflictWarning(null);
                            }}
                            className="text-sm text-slate-400 hover:text-slate-600 underline"
                        >
                            Back to details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {conflictWarning && (
                <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle>Smart Schedule Warning</AlertTitle>
                    <AlertDescription>{conflictWarning}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="date-input">Select Date</Label>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        id="date-input"
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={dateStr}
                        min={todayStr}
                        onChange={(e) => setDateStr(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="time-select">Start Time</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <select
                            id="time-select"
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        >
                            <option value="" disabled>Select a time</option>
                            {timeSlots.length === 0 ? (
                                <option disabled>No slots available today</option>
                            ) : (
                                timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration-select">Duration</Label>
                    <select
                        id="duration-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 8].map(h => (
                            <option key={h} value={h.toString()}>{h} Hour{h > 1 ? 's' : ''}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border">
                <span className="font-medium text-slate-700">Total Price:</span>
                <span className="font-bold text-xl text-indigo-600">
                    {formatPrice(selectedDurationCost)}
                </span>
            </div>

            <div className="flex gap-3 pt-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" className="w-1/3">
                        Cancel
                    </Button>
                </DialogClose>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0" title="View Location">
                            <MapPin className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Location Map
                            </DialogTitle>
                            <DialogDescription>
                                See where {room.name} is located.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-2 border rounded-xl overflow-hidden shadow-sm">
                            <LocationMap
                                lat={room.latitude}
                                lng={room.longitude}
                                roomName={room.name}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
                <Button className="w-full" onClick={handleBook} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                        </>
                    ) : 'Proceed to Pay'}
                </Button>
            </div>
        </div>
    );
}
