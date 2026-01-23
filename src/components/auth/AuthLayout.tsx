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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4 font-sans selection:bg-green-100 dark:selection:bg-green-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-green-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="p-2.5 bg-green-600 rounded-xl shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform duration-200">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">PDFy</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-3xl p-8 mb-6">
                    {children}
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {alternateAction.text}{' '}
                    <Link
                        href={alternateAction.href}
                        className="text-green-600 dark:text-green-500 font-semibold hover:underline"
                    >
                        {alternateAction.linkText}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
