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

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-[#0a0a0a]">
                {/* Page Navigation Left */}
                <button
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                    className="absolute left-4 z-10 p-2 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                {/* Document Page */}
                <div className="relative w-full h-full max-w-4xl flex flex-col items-center justify-center shadow-2xl">
                    <div className="w-full h-full bg-white relative rounded-sm overflow-hidden border border-[#333]">
                        <StaticSlideRenderer
                            documentId={fileId}
                            pageNumber={currentSlideIndex + 1}
                            priority={true}
                            className="w-full h-full object-contain bg-[#1a1a1a]" // bg-dark to avoid flash
                        />
                    </div>
                </div>

                {/* Page Navigation Right */}
                <button
                    onClick={nextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="absolute right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
};

export default DocumentViewer;
