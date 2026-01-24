import React from 'react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-transparent flex items-center justify-center z-[9999] animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-t-gemini-green border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-t-gemini-green/20 border-r-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite] opacity-50"></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Syncing Vault</span>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-gemini-green/10 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
