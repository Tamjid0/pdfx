import React from 'react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#0f0f0f]/60 backdrop-blur-[2px] flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff88]"></div>
                <span className="text-white/70 text-sm font-medium animate-pulse">Processing your document...</span>
            </div>
        </div>
    );
};

export default LoadingOverlay;
