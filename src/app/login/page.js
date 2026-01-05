'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const togglePassword = () => {
        const input = document.getElementById('passwordInput');
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        // Skip actual login logic as per "No auth" rule
        router.push('/');
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-black text-white font-sans">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite] z-0"></div>
            <div className="relative z-10 hidden md:flex flex-col justify-center py-20 px-24 bg-gradient-to-br from-[rgba(0,255,136,0.08)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)] backdrop-blur-lg">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-4 py-3 px-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full mb-8">
                        <span className="text-3xl font-extrabold text-green-400 tracking-tighter">PDFy</span>
                    </div>
                    <h1 className="text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text">Transform chats into professional PDFs</h1>
                </div>
            </div>
            <div className="relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold mb-3">Welcome back</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-4 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white focus:border-green-400 focus:outline-none" placeholder="you@example.com" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                            <input type="password" id="passwordInput" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-4 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white focus:border-green-400 focus:outline-none" placeholder="Enter your password" required />
                        </div>
                        <button type="submit" className="w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer shadow-lg shadow-green-400/40">Sign In</button>
                    </form>
                    <p className="mt-8 text-sm text-gray-400 text-center">Don't have an account? <Link href="/signup" className="text-green-400 font-semibold">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
