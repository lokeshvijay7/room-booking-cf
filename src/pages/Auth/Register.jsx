import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function Register() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const fullName = formData.get('fullName');

        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Show success message instead of redirecting immediately
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <Card className="w-full max-w-md shadow-lg border-slate-100 text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
                        <CardDescription className="text-base text-slate-600 pt-2">
                            Please check your email to confirm your account before logging in.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-8">
                        <Link to="/login">
                            <Button className="w-full sm:w-auto min-w-[200px]">
                                Go to Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-slate-100">
                <CardHeader className="space-y-1 text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your information to get started
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Registration Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="John Doe"
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Button className="w-full h-11 text-base" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                                </>
                            ) : 'Create Account'}
                        </Button>
                        <div className="text-center text-sm text-slate-500 mt-2">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
