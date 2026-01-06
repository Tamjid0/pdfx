import type { Metadata } from 'next';
import './globals.css';

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
                {children}
            </body>
        </html>
    );
}
