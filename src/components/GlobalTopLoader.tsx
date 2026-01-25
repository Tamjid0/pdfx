import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

const GlobalTopLoader: React.FC = () => {
    const isPageLoading = useStore((state) => state.isPageLoading);
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPageLoading) {
            setVisible(true);
            setProgress(10);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    const step = prev < 50 ? 5 : 2;
                    return prev + step;
                });
            }, 300);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 500);
            return () => clearTimeout(timeout);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPageLoading]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none">
            <div
                className="h-[2px] bg-gradient-to-r from-gemini-green/40 via-gemini-green to-teal-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                style={{ width: `${progress}%` }}
            />
            {/* Subtle glow pulse */}
            <div
                className="absolute top-0 right-0 h-4 w-4 bg-gemini-green/20 blur-lg rounded-full animate-pulse"
                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
            />
        </div>
    );
};

export default GlobalTopLoader;
