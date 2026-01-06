import React from 'react';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gemini-green"></div>
        </div>
    );
};

export default LoadingOverlay;
