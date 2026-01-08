import React from 'react';
import { useStore } from '../../store/useStore';

const IconChevronLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const IconChevronRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const SlideViewer: React.FC = () => {
    const { slides, currentSlideIndex, nextSlide, prevSlide } = useStore();
    const currentSlide = slides[currentSlideIndex];

    if (!currentSlide) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#666]">
                <p className="text-lg">No slides loaded</p>
            </div>
        );
    }

    return (
        <div className="slide-viewer flex flex-col h-full bg-[#0a0a0a] relative group overflow-hidden animate-in fade-in duration-500">
            {/* Main Slide Area */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="slide-content-container aspect-[16/9] w-full max-w-[900px] bg-[#1a1a1a] rounded-xl border border-[#333] shadow-2xl relative flex flex-col items-center justify-center p-12 transition-all duration-300 hover:border-[#00ff88]/30">
                    <div className="slide-header absolute top-8 left-12 right-12 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-[0.2em]">Slide {currentSlideIndex + 1}</span>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-6 text-center leading-tight">
                        {currentSlide.title}
                    </h2>

                    <div className="slide-body w-full max-w-[600px]">
                        {currentSlide.content?.split('\n').map((line: string, i: number) => (
                            <p key={i} className="text-[#ccc] text-lg text-center mb-4 leading-relaxed font-light">
                                {line}
                            </p>
                        ))}
                    </div>

                    <div className="absolute bottom-8 right-12 opacity-20 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono text-white/50">{currentSlideIndex + 1} / {slides.length}</span>
                    </div>
                </div>

                {/* Floating Navigation Controls */}
                <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                        className="p-3 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                        <IconChevronLeft />
                    </button>
                </div>

                <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[10px] group-hover:translate-x-0">
                    <button
                        onClick={nextSlide}
                        disabled={currentSlideIndex === slides.length - 1}
                        className="p-3 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                        <IconChevronRight />
                    </button>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="h-1 bg-[#222] w-full">
                <div
                    className="h-full bg-[#00ff88] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                    style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default SlideViewer;
