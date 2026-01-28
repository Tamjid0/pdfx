import type { Metadata } from 'next';
import './globals.css';

import GlobalTopLoader from '../components/GlobalTopLoader';

export const metadata: Metadata = {
    title: 'PDFX - AI Document Assistant',
    description: 'Chat, summarize, and analyze your documents with AI.',
};

import ErrorBoundary from '../components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-black text-white antialiased" suppressHydrationWarning>
                <ErrorBoundary>
                    <GlobalTopLoader />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#111',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                fontSize: '13px',
                                fontWeight: 500
                            }
                        }}
                    />
                    {children}
                </ErrorBoundary>
            </body>
        </html>
    );
}
