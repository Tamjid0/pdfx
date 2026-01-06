import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';

const Signup: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

    const togglePassword = (id: string) => {
        const input = document.getElementById(id) as HTMLInputElement;
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const success = await signup(firstName, lastName, email, password);
        if (success) {
            router.push('/');
        } else {
            setError('User with this email already exists');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-black text-white font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite] z-0"></div>
            <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out] top-[-250px] left-[-250px]"></div>
            <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,#00cc66_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_5s] bottom-[-200px] right-1/4"></div>
            <div className="absolute w-[350px] h-[350px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_10s] top-1/2 right-[-150px]"></div>

            {/* Left Side - Branding */}
            <div className="relative z-10 hidden md:flex flex-col justify-center py-20 px-24 bg-gradient-to-br from-[rgba(0,255,136,0.08)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)] backdrop-blur-lg">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-4 py-3 px-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full mb-8">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-black">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-extrabold text-green-400 tracking-tighter">PDFy</span>
                    </div>

                    <h1 className="text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text">Transform chats into professional PDFs</h1>
                    <p className="text-lg text-gray-400 max-w-md mb-12">The most powerful PDF converter with AI-powered formatting. Perfect for developers, designers, and teams who value quality.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-black">
                                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Smart Formatting</h3>
                            <p className="text-sm text-gray-400">Automatically formats code, math, and text.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-black">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Cloud Storage</h3>
                            <p className="text-sm text-gray-400">Save and access your projects from anywhere.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl">
                <div className="w-full max-w-md">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-3">Create an account</h2>
                        <p className="text-gray-400">Already have an account? <Link href="/login" className="font-semibold text-green-400 hover:text-green-300 transition-colors">Sign in</Link></p>
                    </div>

                    <form onSubmit={handleSignup}>
                        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">First Name</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" placeholder="John" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Last Name</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" placeholder="Doe" required />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" placeholder="you@example.com" required />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" id="signupPassword" placeholder="••••••••" required minLength={8} />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors" onClick={() => togglePassword('signupPassword')}>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
                            <div className="relative">
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" id="confirmPassword" placeholder="••••••••" required minLength={8} />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors" onClick={() => togglePassword('confirmPassword')}>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-green-400" required />
                                <span className="text-sm text-gray-300">I agree to the <a href="#" className="text-green-400 hover:text-green-300">Terms</a> and <a href="#" className="text-green-400 hover:text-green-300">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button type="submit" className="w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer transition-all shadow-lg shadow-green-400/40 hover:shadow-xl hover:shadow-green-400/50 hover:-translate-y-0.5 relative overflow-hidden group">
                            <span className="relative z-10">Create Account</span>
                            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-full"></div>
                        </button>
                    </form>

                    <div className="text-center text-xs text-gray-500 mt-6">
                        By signing up, you agree to our <a href="#" className="text-green-400 hover:underline">Terms of Service</a> and <a href="#" className="text-green-400 hover:underline">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
