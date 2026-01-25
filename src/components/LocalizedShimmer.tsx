import React from 'react';

interface LocalizedShimmerProps {
    className?: string;
    blocks?: number;
}

const LocalizedShimmer: React.FC<LocalizedShimmerProps> = ({ className = '', blocks = 3 }) => {
    return (
        <div className={`animate-in fade-in duration-700 space-y-4 ${className}`}>
            {[...Array(blocks)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <div
                        className="h-3 bg-white/5 rounded-full w-3/4 animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                    <div
                        className="h-3 bg-white/[0.03] rounded-full w-full animate-pulse"
                        style={{ animationDelay: `${i * 150 + 50}ms` }}
                    />
                    <div
                        className="h-3 bg-white/[0.02] rounded-full w-1/2 animate-pulse"
                        style={{ animationDelay: `${i * 150 + 100}ms` }}
                    />
                </div>
            ))}
        </div>
    );
};

export default LocalizedShimmer;
