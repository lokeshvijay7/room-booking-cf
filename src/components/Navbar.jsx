import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    User,
    LogOut,
    LayoutDashboard,
    Hotel,
    CalendarCheck,
    ChevronDown,
    Menu,
    X
} from 'lucide-react';

export default function Navbar() {
    const { user, signOut, isAdmin } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Hotel className="h-5 w-5 text-primary" />
                    </div>
                    <span>RoomBooker</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <>
                            <nav className="flex items-center gap-6 text-sm font-medium">
                                {!isAdmin && (
                                    <>
                                        <Link
                                            to="/"
                                            className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            Browse Rooms
                                        </Link>
                                        <Link
                                            to="/my-bookings"
                                            className={`transition-colors hover:text-primary ${isActive('/my-bookings') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            My Bookings
                                        </Link>
                                    </>
                                )}
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={`flex items-center gap-1 transition-colors hover:text-primary ${isActive('/admin') ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Admin Panel
                                    </Link>
                                )}
                            </nav>

                            <div className="h-6 w-px bg-border mx-2" />

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 text-sm font-medium focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-slate-100 border flex items-center justify-center text-slate-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="font-semibold">{user.user_metadata?.full_name || 'User'}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">{user.email}</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 space-y-1">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                My Account
                                            </div>
                                            <Link
                                                to="/my-bookings"
                                                className="flex items-center px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                            >
                                                <CalendarCheck className="mr-2 h-4 w-4" />
                                                <span>My Bookings</span>
                                            </Link>
                                            <div className="h-px bg-muted my-1" />
                                            <button
                                                onClick={signOut}
                                                className="flex w-full items-center px-2 py-2 text-sm rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-muted-foreground"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background animate-in slide-in-from-top-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 px-2 pb-4 border-b">
                                <div className="h-10 w-10 rounded-full bg-slate-100 border flex items-center justify-center text-slate-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-semibold">{user.user_metadata?.full_name || 'User'}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                            <nav className="flex flex-col space-y-2">
                                <Link
                                    to="/"
                                    className={`px-2 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                >
                                    Browse Rooms
                                </Link>
                                <Link
                                    to="/my-bookings"
                                    className={`px-2 py-2 rounded-md text-sm font-medium ${isActive('/my-bookings') ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                >
                                    My Bookings
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={`px-2 py-2 rounded-md text-sm font-medium text-primary ${isActive('/admin') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={signOut}
                                    className="text-left px-2 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10"
                                >
                                    Sign Out
                                </button>
                            </nav>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Sign In</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
