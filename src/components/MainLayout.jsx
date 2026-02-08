import { Outlet } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/toaster';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
            <Navbar />
            {/* Removed p-4 py-8 container constraint to allow full-width hero sections */}
            <main className="flex-grow">
                <Outlet />
            </main>
            <Toaster />

            <footer className="border-t py-12 bg-slate-900 text-slate-300">
                <div className="container mx-auto px-4 grid gap-10 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Hotel className="h-6 w-6 text-primary" />
                            </div>
                            RoomBooker
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Empowering teams with flexible, premium workspaces on demand.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Locations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-white">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    &copy; 2026 RoomBooking Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
