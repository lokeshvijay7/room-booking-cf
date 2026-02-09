import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { Download, Ticket, Calendar, Clock, MapPin, User, CheckCircle, Printer, X } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingTicket({ booking, room, user }) {
    const ticketRef = useRef();

    if (!booking || !room) return null;

    // Generate a secure-looking verification string or URL
    const qrValue = JSON.stringify({
        id: booking.id,
        room: room.name,
        user: user?.email,
        time: booking.start_time,
        status: 'valid'
    });

    const downloadTicket = () => {
        // Simple download logic (html-to-image would be better but keeping it simple)
        const svg = document.getElementById("booking-qr-code");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `ticket-${booking.id}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Ticket className="w-4 h-4" /> View Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/20 p-2 hover:bg-black/40 transition-colors text-white" asChild>
                    <button>
                        <X className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </DialogClose>

                {/* Header Section */}
                <div className="bg-primary p-6 text-center border-b border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                    <h3 className="text-xl font-bold text-primary-foreground flex items-center justify-center gap-2 relative z-10">
                        <CheckCircle className="w-6 h-6" /> Access Pass
                    </h3>
                    <p className="text-xs text-primary-foreground/80 uppercase tracking-widest mt-1 relative z-10">Confirmed Booking</p>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6" ref={ticketRef}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">{room.name}</h2>
                        <div className="flex items-center justify-center gap-1 text-slate-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">Tech City, Building A</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Date</span>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(new Date(booking.start_time), 'MMM d, yyyy')}
                            </div>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Time</span>
                            <div className="flex items-center justify-end gap-2 text-slate-700 font-medium">
                                <Clock className="w-4 h-4 text-primary" />
                                {format(new Date(booking.start_time), 'HH:mm')}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Guest</span>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <User className="w-4 h-4 text-primary" />
                                <span className="truncate max-w-[100px]">{user?.user_metadata?.full_name || 'User'}</span>
                            </div>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-xs text-slate-400 uppercase font-semibold">Booking ID</span>
                            <div className="text-xs font-mono text-slate-600">#{booking.id.slice(0, 8)}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                        <div className="p-2 bg-white rounded-xl border shadow-sm">
                            <QRCode
                                id="booking-qr-code"
                                value={qrValue}
                                size={140}
                                level={"H"}
                                fgColor="#1e293b"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 text-center max-w-[200px]">
                            Scan this QR code at the reception to check-in to your room.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 flex gap-3 border-t">
                    <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button className="flex-1 gap-2" onClick={downloadTicket}>
                        <Download className="w-4 h-4" /> Save Image
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
