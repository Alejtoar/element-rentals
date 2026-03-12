"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoginPageProps {
    params: Promise<{ lang: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
    const { lang } = use(params);
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await api.auth.login({ email, password });
            setAuthToken(response.access_token);

            // Redirect to admin dashboard
            router.push(`/${lang}/admin/properties`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#265140' }}> {/* brand-forest */}
            <div className="relative w-full max-w-md">
                {/* Brand Card */}
                <div
                    className="rounded-sm p-10"
                    style={{
                        backgroundColor: '#f4f2eb', /* brand-cream */
                        border: '1px solid rgba(82,120,88,0.18)', /* brand-sage border */
                        boxShadow: '0 8px 30px rgba(38,81,64,0.3)',
                    }}
                >
                    {/* Sage top accent bar */}
                    <div
                        className="w-12 h-1 rounded-full mb-8 mx-auto"
                        style={{ backgroundColor: '#527858' }}
                    />

                    {/* Logo/Brand */}
                    <div className="text-center mb-10">
                        <h1
                            className="text-4xl font-bold mb-2"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.02em' }}
                        >
                            Elemnt Rentals
                        </h1>
                        <p
                            className="text-sm uppercase tracking-widest font-bold"
                            style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}
                        >
                            Admin Portal
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs uppercase tracking-widest font-bold mb-2"
                                style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                placeholder="admin@elemnt.com"
                                required
                                className="w-full rounded-sm transition-all duration-200 focus:outline-none focus:ring-0"
                                style={{
                                    backgroundColor: '#e6e3d7',
                                    border: '1px solid rgba(82,120,88,0.25)',
                                    color: '#4b3d1c',
                                    fontFamily: "'MegantZ', serif",
                                    padding: '0.75rem 1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs uppercase tracking-widest font-bold mb-2"
                                style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full rounded-sm transition-all duration-200 focus:outline-none focus:ring-0"
                                style={{
                                    backgroundColor: '#e6e3d7',
                                    border: '1px solid rgba(82,120,88,0.25)',
                                    color: '#4b3d1c',
                                    fontFamily: "'MegantZ', serif",
                                    padding: '0.75rem 1rem'
                                }}
                            />
                        </div>

                        {error && (
                            <div
                                className="p-4 rounded-sm text-center font-medium text-sm"
                                style={{ backgroundColor: 'rgba(255,100,100,0.1)', color: '#cc4444', border: '1px solid rgba(255,100,100,0.2)' }}
                            >
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="sand"
                                disabled={isLoading}
                                className="w-full rounded-sm uppercase tracking-wider font-bold transition-all duration-300 hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div
                        className="mt-8 text-center text-xs font-bold uppercase tracking-widest pt-6"
                        style={{ borderTop: '1px solid rgba(82,120,88,0.15)', color: 'rgba(75,61,28,0.4)', fontFamily: "'Berlin Sans', sans-serif" }}
                    >
                        Secure admin access only
                    </div>
                </div>
            </div>
        </div>
    );
}
