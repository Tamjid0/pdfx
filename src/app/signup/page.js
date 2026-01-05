'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        router.push('/');
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-black text-white font-sans">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite] z-0"></div>
            <div className="relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold mb-3">Create an account</h2>
                    <form onSubmit={handleSignup}>
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-4 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white focus:border-green-400 focus:outline-none" placeholder="you@example.com" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-4 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white focus:border-green-400 focus:outline-none" placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer shadow-lg shadow-green-400/40">Sign Up</button>
                    </form>
                    <p className="mt-8 text-sm text-gray-400 text-center">Already have an account? <Link href="/login" className="text-green-400 font-semibold">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
