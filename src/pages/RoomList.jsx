import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import BookingForm from '@/components/bookings/BookingForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wifi, Monitor, Clock, ShieldCheck, MapPin, CalendarCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';

export default function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const data = await api.getRooms();
                setRooms(data || []);
            } catch (err) {
                console.error('Error fetching rooms:', err);
                setError("Unable to load rooms. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchRooms();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen pb-12 flex flex-col">
            {/* Simple Hero Section */}
            <section className="bg-white py-20 border-b">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Book a Meeting Room
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Find a quiet space to work or a large room for your team meeting.
                        Simple, fast, and affordable.
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-500" /> Instant Confirm</span>
                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-500" /> No Hidden Fees</span>
                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-500" /> Secure Access</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 flex-grow">

                {error && (
                    <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Issue</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading available rooms...</p>
                    </div>
                ) : rooms.length === 0 && !error ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg border">
                        <p className="text-slate-500">No rooms found. Please contact support.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {rooms.map((room) => (
                            <Card key={room.id} className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                                {/* Image */}
                                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                                    {room.image_url ? (
                                        <img
                                            src={room.image_url}
                                            alt={room.name}
                                            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-md shadow-sm font-bold text-sm text-slate-800">
                                        {formatPrice(room.price_per_hour)} / hr
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl text-slate-900">{room.name}</CardTitle>
                                    <CardDescription className="text-slate-500 mt-1 line-clamp-2">
                                        {room.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <span>{room.capacity} People</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border">
                                            <Wifi className="h-4 w-4 text-slate-400" />
                                            <span>WiFi</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border">
                                            <Monitor className="h-4 w-4 text-slate-400" />
                                            <span>Screen</span>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 pb-6">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full" size="lg">
                                                Book This Room
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[450px]">
                                            <div className="border-b pb-4 mb-4">
                                                <h2 className="text-lg font-bold">Book {room.name}</h2>
                                                <p className="text-sm text-slate-500">Select your date and time below.</p>
                                            </div>
                                            <BookingForm room={room} onSuccess={() => {
                                                // Wait 2 seconds before reloading so user sees success message
                                                setTimeout(() => {
                                                    window.location.reload();
                                                }, 2000);
                                            }} />
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* How it Works Section */}
            <section className="bg-white py-16 border-t border-b">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-2">Choose a Space</h3>
                            <p className="text-slate-500">Browse our wide range of rooms and pick the one that fits your needs.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-2">Book Instantly</h3>
                            <p className="text-slate-500">Select your date and time, and confirm your booking in seconds.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-2">Get to Work</h3>
                            <p className="text-slate-500">Receive your access code and enjoy a productive workspace.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ / Info Section */}
            <section className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Common Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Can I book for just one hour?
                            </h3>
                            <p className="text-slate-600">Yes! Our minimum booking duration is just 1 hour.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-500" /> Where are the rooms located?
                            </h3>
                            <p className="text-slate-600">We have locations in downtown business districts, easily accessible by public transport.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Is it secure?
                            </h3>
                            <p className="text-slate-600">Absolutely. All buildings have 24/7 security and secure access control.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-indigo-500" /> Can I cancel my booking?
                            </h3>
                            <p className="text-slate-600">You can cancel up to 24 hours before your booking time for a full refund.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function CheckCircleIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    )
}
