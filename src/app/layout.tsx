import type { Metadata } from 'next';
import './globals.css';

import GlobalTopLoader from '../components/GlobalTopLoader';

export const metadata: Metadata = {
    title: 'PDFX - AI Document Assistant',
    description: 'Chat, summarize, and analyze your documents with AI.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-black text-white antialiased" suppressHydrationWarning>
                <GlobalTopLoader />
                {children}
            </body>
        </html>
    );
}
