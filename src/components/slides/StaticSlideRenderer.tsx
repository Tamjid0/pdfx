import React, { useState } from 'react';

interface StaticSlideRendererProps {
    documentId: string;
    pageNumber: number;
    className?: string;
    priority?: boolean; // If true, sets loading="eager"
}

import { getAuthHeaders } from '../../services/apiService';

const StaticSlideRenderer: React.FC<StaticSlideRendererProps> = ({
    documentId,
    pageNumber,
    className,
    priority = false
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Fetch the image with Authentication
    React.useEffect(() => {
        let isMounted = true;
        let blobUrl: string | null = null;

        const fetchImage = async () => {
            setIsLoading(true);
            setHasError(false);
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`/api/v1/documents/${documentId}/pages/${pageNumber}`, {
                    headers
                });

                if (!response.ok) throw new Error('Failed to load image');

                const blob = await response.blob();
                blobUrl = URL.createObjectURL(blob);

                if (isMounted) {
                    setImageUrl(blobUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error fetching slide image:", err);
                if (isMounted) {
                    setHasError(true);
                    setIsLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Clean up blob to avoid memory leaks
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [documentId, pageNumber]);

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
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`Slide ${pageNumber}`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    draggable={false}
                />
            )}
        </div>
    );
};

export default StaticSlideRenderer;
