import React, { useState } from 'react';

interface StaticSlideRendererProps {
    documentId: string;
    pageNumber: number;
    className?: string;
    priority?: boolean; // If true, sets loading="eager"
}

const StaticSlideRenderer: React.FC<StaticSlideRendererProps> = ({
    documentId,
    pageNumber,
    className,
    priority = false
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Construct URL for the static image API
    const imageUrl = `/api/v1/documents/${documentId}/pages/${pageNumber}`;

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#1a1a1a]/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-[#888]">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs">Failed to load slide</span>
                </div>
            )}

            {/* Static Image */}
            <img
                src={imageUrl}
                alt={`Slide ${pageNumber}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                loading={priority ? "eager" : "lazy"}
                onLoad={handleLoad}
                onError={handleError}
                draggable={false}
            />
        </div>
    );
};

export default StaticSlideRenderer;
