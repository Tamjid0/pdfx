import React from 'react';

interface LoadingOverlayProps {
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
    return (
        <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-500 pointer-events-none">
            <div className="relative w-12 h-12 mb-4">
                {/* Slim outer ring */}
                <div className="absolute inset-0 rounded-full border border-white/5"></div>
                {/* Active spinning arc */}
                <div className="absolute inset-0 rounded-full border border-t-gemini-green border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                {/* Outer glow ring */}
                <div className="absolute -inset-1 rounded-full border border-gemini-green/10 blur-[2px] animate-pulse"></div>
            </div>
            {message && <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gemini-green/60 animate-pulse">{message}</p>}
        </div>
    );
};

export default LoadingOverlay;
