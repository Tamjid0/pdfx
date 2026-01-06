import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const togglePassword = () => {
        const input = document.getElementById('passwordInput') as HTMLInputElement;
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            router.push('/');
        } else {
            setError('Invalid email or password');
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

                <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">50K+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">1M+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">PDFs Created</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">99.9%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Uptime</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl">
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <h2 className="text-4xl font-bold mb-3">Welcome back</h2>
                        <p className="text-gray-400">New to PDFy? <Link href="/signup" className="font-semibold text-green-400 hover:text-green-300 transition-colors">Create an account</Link></p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" placeholder="you@example.com" required />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10" id="passwordInput" placeholder="••••••••" required />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors" onClick={togglePassword}>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-green-400" />
                                <span className="text-sm text-gray-300">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-green-400 hover:text-green-300 transition-colors">Forgot password?</a>
                        </div>

                        <button type="submit" className="w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer transition-all shadow-lg shadow-green-400/40 hover:shadow-xl hover:shadow-green-400/50 hover:-translate-y-0.5 relative overflow-hidden group">
                            <span className="relative z-10">Sign In</span>
                            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-full"></div>
                        </button>
                    </form>

                    <div className="text-center text-xs text-gray-500 mt-6">
                        Protected by industry-standard encryption
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
