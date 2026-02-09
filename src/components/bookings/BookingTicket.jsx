import QRCode from "react-qr-code";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Ticket, X, Printer, Download } from "lucide-react";

export default function BookingTicket({ booking, room, user }) {
    // Unique data string for the QR
    const qrData = JSON.stringify({
        id: booking.id,
        user: user.email,
        room: room.name,
        time: booking.start_time,
        status: 'valid'
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <QrCode className="w-4 h-4" /> View Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-xl gap-0 border-0 shadow-2xl">
                {/* Close Button */}
                <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/20 p-2 hover:bg-black/40 transition-colors text-white" asChild>
                    <button>
                        <X className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </DialogClose>

                {/* Ticket Header */}
                <div className="bg-primary p-8 text-primary-foreground text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-90" />
                    <h2 className="text-2xl font-bold relative z-10 tracking-tight">Access Pass</h2>
                    <p className="text-sm opacity-80 relative z-10 mt-1">Please show this at the reception</p>
                </div>

                {/* Ticket Body */}
                <div className="p-6 relative bg-white">
                    {/* Perforated Edges */}
                    <div className="absolute -top-3 left-0 w-full h-6 flex justify-between px-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="w-4 h-1 bg-white rounded-full mx-1 opacity-50" />
                        ))}
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-6 mt-4">
                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white transition-colors">
                            <QRCode
                                size={180}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={qrData}
                                viewBox={`0 0 256 256`}
                            />
                        </div>

                        <div className="text-center space-y-1 w-full">
                            <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                            <p className="text-xs text-slate-400 font-mono bg-slate-100 py-1 px-3 rounded-full inline-block">
                                ID: {booking.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-y-4 gap-x-8 text-sm border-t pt-6">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Guest</p>
                                <p className="font-semibold text-slate-800 truncate" title={user.email}>
                                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Date</p>
                                <p className="font-semibold text-slate-800">{format(new Date(booking.start_time), 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Time</p>
                                <p className="font-semibold text-slate-800">{format(new Date(booking.start_time), 'h:mm a')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</p>
                                <div className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                    CONFIRMED
                                </div>
                            </div>
                        </div>

                        <div className="w-full pt-4">
                            <Button variant="outline" className="w-full gap-2 border-slate-200" onClick={handlePrint}>
                                <Printer className="w-4 h-4" /> Print Ticket
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
