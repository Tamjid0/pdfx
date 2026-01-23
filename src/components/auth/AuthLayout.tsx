import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    alternateAction: {
        text: string;
        linkText: string;
        href: string;
    };
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, alternateAction }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans selection:bg-green-500/30">
            {/* Dynamic Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform duration-200">
                            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">PDFy</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                    <p className="text-gray-400">{subtitle}</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8 mb-6 overflow-hidden relative group">
                    {/* Subtle inner border glow */}
                    <div className="absolute inset-0 border border-green-500/10 rounded-3xl pointer-events-none" />
                    {children}
                </div>

                <p className="text-center text-sm text-gray-500">
                    {alternateAction.text}{' '}
                    <Link
                        href={alternateAction.href}
                        className="text-green-500 font-semibold hover:text-green-400 transition-colors"
                    >
                        {alternateAction.linkText}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
