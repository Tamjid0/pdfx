import React from 'react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-transparent flex items-center justify-center z-[9999] animate-in fade-in duration-500 pointer-events-none">
            <div className="relative w-12 h-12">
                {/* Slim outer ring */}
                <div className="absolute inset-0 rounded-full border border-white/5"></div>
                {/* Active spinning arc */}
                <div className="absolute inset-0 rounded-full border border-t-gemini-green border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                {/* Outer glow ring */}
                <div className="absolute -inset-1 rounded-full border border-gemini-green/10 blur-[2px] animate-pulse"></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
