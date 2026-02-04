import React, { useState, useEffect } from 'react';

interface HideContentToggleProps {
    storageKey: string; // Unique key for localStorage persistence
    children: React.ReactNode; // Content to potentially hide
    enabled?: boolean; // Whether the toggle feature is active
}

const HideContentToggle: React.FC<HideContentToggleProps> = ({ storageKey, children, enabled = true }) => {
    const [isHidden, setIsHidden] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        if (!enabled) return;
        const saved = localStorage.getItem(storageKey);
        if (saved === 'true') {
            setIsHidden(true);
        }
    }, [storageKey, enabled]);

    // Save state to localStorage when it changes
    useEffect(() => {
        if (!enabled) return;
        localStorage.setItem(storageKey, String(isHidden));
    }, [isHidden, storageKey, enabled]);

    // If not enabled, just return children
    if (!enabled) return <>{children}</>;

    const toggleVisibility = () => {
        setIsHidden(!isHidden);
    };

    return (
        <div className="relative w-full h-full">
            {/* Eye Icon Toggle Button */}
            <button
                onClick={toggleVisibility}
                className="absolute top-4 right-4 z-50 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-md group"
                title={isHidden ? 'Show Content' : 'Hide Content'}
            >
                {isHidden ? (
                    // Eye Off Icon
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                ) : (
                    // Eye Icon
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>

            {/* Content */}
            <div className={`w-full h-full transition-opacity duration-300 ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {children}
            </div>

            {/* Overlay when hidden */}
            {isHidden && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-40 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Content Hidden</h3>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                Click the eye icon to reveal the content
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HideContentToggle;
