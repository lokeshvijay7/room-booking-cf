import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Wifi, Monitor, MapPin } from 'lucide-react';
import BookingForm from '@/components/bookings/BookingForm';
import LocationMap from '@/components/ui/LocationMap';

export default function RoomCard({ room }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group flex flex-col h-full">
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

            <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{room.capacity} People</span>
                    </div>
                    {/* Add more features if available in room object or consistently */}
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
                <div className="flex gap-2 w-full">
                    {/* Location Button */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" title="View Location" className="shrink-0 w-10 h-10">
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {room.name} Location
                                </DialogTitle>
                                <DialogDescription>
                                    Exact location details for this room.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="w-full h-[500px]">
                                <LocationMap
                                    lat={room.latitude}
                                    lng={room.longitude}
                                    roomName={room.name}
                                    className="h-full w-full rounded-none border-t"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Booking Button */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="flex-1" size="lg">
                                Book This Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px]">
                            <DialogHeader>
                                <DialogTitle>Book {room.name}</DialogTitle>
                                <DialogDescription>Select your date and time below.</DialogDescription>
                            </DialogHeader>
                            <BookingForm room={room} onSuccess={() => {
                                setTimeout(() => {
                                    window.location.reload();
                                }, 2000);
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardFooter>
        </Card>
    );
}
