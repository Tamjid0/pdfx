import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="sidebar w-16 bg-[#111] border-r border-[#222] flex flex-col py-4 gap-2 items-center">
            {/* Home Icon (Workspace) */}
            <Link
                href="/"
                className={`sidebar-item w-12 h-12 flex items-center justify-center cursor-pointer transition-all rounded-lg relative hover:scale-105 active:scale-95 ${isActive('/') ? 'bg-gemini-green text-black' : 'bg-transparent text-[#999] hover:bg-white/5'}`}
                title="Workspace"
            >
                <svg className="icon w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            </Link>

            {/* Projects Icon (Dashboard) */}
            <Link
                href="/dashboard"
                className={`sidebar-item w-12 h-12 flex items-center justify-center cursor-pointer transition-all rounded-lg relative hover:scale-105 active:scale-95 ${isActive('/dashboard') ? 'bg-gemini-green text-black' : 'bg-transparent text-[#999] hover:bg-white/5'}`}
                title="My Projects"
            >
                <svg className="icon w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
            </Link>

            {/* Analytics Icon */}
            <div className="sidebar-item group w-12 h-12 flex items-center justify-center cursor-default opacity-30 transition-all rounded-lg relative">
                <svg className="icon w-6 h-6 fill-current text-[#999]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
            </div>

            {/* Settings Icon - at the bottom */}
            <div className="sidebar-item group w-12 h-12 flex items-center justify-center cursor-default opacity-30 transition-all rounded-lg relative mt-auto">
                <svg className="icon w-6 h-6 fill-current text-[#999]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36 2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
            </div>
        </div>
    );
};

export default Sidebar;
