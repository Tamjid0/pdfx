'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
    const { user, mongoUser, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="bg-gradient-to-r from-gemini-dark-200 to-gemini-dark-300 h-16 flex items-center justify-between px-8 border-b border-gemini-green/10 shadow-lg z-50">
            <div className="flex items-center gap-12">
                <div className="text-2xl font-bold text-gemini-green tracking-tight flex items-center gap-2">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-7 h-7">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    PDFy
                </div>
                <nav className="flex gap-2">
                    <a className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10 text-gemini-green bg-gemini-green/15">Dashboard</a>
                    <a className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Projects</a>
                    <a className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Templates</a>
                    <a className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Community</a>
                </nav>
            </div>
            <div className="flex gap-3 items-center">
                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Credits Badge */}
                        {mongoUser && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-gemini-green/10 border border-gemini-green/20 rounded-full">
                                <span className="text-[10px] font-black tracking-widest text-gemini-green uppercase">Credits: {mongoUser.credits}</span>
                                {mongoUser.tier === 'premium' && (
                                    <span className="w-1.5 h-1.5 bg-gemini-green rounded-full shadow-[0_0_8px_rgba(0,255,136,0.8)]"></span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3 px-3 py-1.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-full cursor-pointer transition-all ml-3 hover:border-gemini-green hover:bg-[#252525]">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gemini-green to-gemini-green-400 flex items-center justify-center font-semibold text-sm text-black uppercase">
                                    {(user.displayName || mongoUser?.displayName || user.email || 'U').charAt(0)}
                                </div>
                                <div className="w-2 h-2 bg-gemini-green rounded-full border-2 border-gemini-dark-300 absolute bottom-0 right-0"></div>
                            </div>
                            <span className="text-sm font-medium text-white truncate max-w-[120px]">
                                {user.displayName || mongoUser?.displayName || user.email?.split('@')[0] || 'User'}
                            </span>
                            <button onClick={handleLogout} className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Logout</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 ml-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Guest Access</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-white hover:bg-white/5">Login</Link>
                            <Link href="/signup" className="bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 hover:bg-gemini-green-300">Sign Up</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
