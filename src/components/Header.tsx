'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
    const { user, logout } = { user: null as any, logout: () => { } }; // Mock auth for now
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
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
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-full cursor-pointer transition-all ml-3 hover:border-gemini-green hover:bg-[#252525]">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gemini-green to-gemini-green-400 flex items-center justify-center font-semibold text-sm text-black">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
                            <div className="w-2 h-2 bg-gemini-green rounded-full border-2 border-gemini-dark-300 absolute bottom-0 right-0"></div>
                        </div>
                        <span className="text-sm font-medium text-white">{user.firstName} {user.lastName}</span>
                        <button onClick={handleLogout} className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Logout</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 ml-3">
                        <Link href="/login" className="text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10">Login</Link>
                        <Link href="/signup" className="bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px">Sign Up</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
