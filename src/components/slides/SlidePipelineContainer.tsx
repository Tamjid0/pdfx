import React from 'react';
import SlideViewer from './SlideViewer';
import SlideThumbnails from './SlideThumbnails';

const SlidePipelineContainer: React.FC = () => {
    return (
        <div className="slide-pipeline-container flex h-full bg-[#0a0a0a] animate-in slide-in-from-left-4 duration-700">
            {/* Left Sidebar for Thumbnails */}
            <SlideThumbnails />

            {/* Main Viewing Area */}
            <div className="flex-1 overflow-hidden">
                <SlideViewer />
            </div>
        </div>
    );
};

export default SlidePipelineContainer;
