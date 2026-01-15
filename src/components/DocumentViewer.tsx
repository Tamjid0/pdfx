import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import StaticSlideRenderer from './slides/StaticSlideRenderer';

const DocumentViewer: React.FC = () => {
    const {
        fileId,
        slides, // heavily overloaded term now, really means "Pages"
        setFileId,
        setFileType,
        setSlides
    } = useStore();

    // Local state for navigation since we don't need global slide index for simple PDF viewing
    // (Unless we want it to persist if we switch tabs? For now local is fine or we reuse currentSlideIndex)
    // Actually, reusing currentSlideIndex from store is better for consistency if we want to add chat citations later.
    const { currentSlideIndex, setCurrentSlideIndex, nextSlide, prevSlide } = useStore();

    const handleBackToEditor = () => {
        // Reset file state to return to "Empty" editor or Text mode
        // We keep the htmlPreview intact if possible? 
        // User said: "button to get back to the editor mode to upload or paste new file"
        setFileId(null);
        setFileType(null);
        setSlides([]);
        setCurrentSlideIndex(0);
    };

    if (!fileId) return null;

    return (
        <div className="document-viewer flex flex-col h-full bg-[#151515] relative animate-in fade-in duration-300">
            {/* Toolbar / Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#1a1a1a]">
                <button
                    onClick={handleBackToEditor}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#888] hover:text-white uppercase tracking-widest hover:bg-[#333] rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Editor
                </button>

                <div className="text-xs font-mono text-[#666]">
                    Page {currentSlideIndex + 1} / {slides.length}
                </div>
            </div>

            {/* Main Content Area - Native PDF Viewer */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-0 bg-[#0a0a0a]">
                <object
                    data={`/api/v1/documents/${fileId}/pdf`}
                    type="application/pdf"
                    className="w-full h-full"
                >
                    <div className="flex items-center justify-center h-full text-[#666]">
                        <p>Unable to display PDF. <a href={`/api/v1/documents/${fileId}/pdf`} target="_blank" className="text-[#00ff88] hover:underline">Download</a> instead.</p>
                    </div>
                </object>
            </div>
        </div>
    );
};

export default DocumentViewer;
