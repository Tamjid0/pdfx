import React from 'react';
import { useStore } from '../../store/useStore';
import PdfSlideRenderer from './PdfSlideRenderer';

const SlideThumbnails: React.FC = () => {
    const { slides, currentSlideIndex, setCurrentSlideIndex, fileId, isProcessingSlides } = useStore();

    const pdfUrl = fileId ? `/api/v1/documents/${fileId}/pdf` : null;

    return (
        <div className="slide-thumbnails w-[220px] bg-[#111] border-r border-[#222] flex flex-col overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-[#222] bg-[#1a1a1a]">
                <h3 className="text-xs font-bold text-[#888] uppercase tracking-widest">Slides Preview</h3>
            </div>

            <div className="p-3 flex flex-col gap-4">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`group relative cursor-pointer transition-all duration-300 ${currentSlideIndex === index ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                            }`}
                    >
                        <div className={`aspect-[16/9] w-full bg-[#1a1a1a] rounded-lg border flex flex-col transition-all duration-300 relative overflow-hidden ${currentSlideIndex === index
                            ? 'border-[#00ff88] ring-1 ring-[#00ff88]/50 shadow-[0_0_15px_rgba(0,255,136,0.15)] bg-[#222]'
                            : 'border-[#333] hover:border-[#444] grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                            }`}>

                            {/* Slide Preview Background */}
                            {pdfUrl && !isProcessingSlides ? (
                                <div className="absolute inset-0 z-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                                    <PdfSlideRenderer
                                        url={pdfUrl}
                                        pageNumber={index + 1}
                                        scale={0.4}
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
                                    <div className="w-full h-0.5 bg-white/5" />
                                </div>
                            )}

                            {/* Content Overlay (Optional or just Title) */}
                            <div className="relative z-10 p-3 h-full flex flex-col bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                <span className="text-[8px] font-bold text-[#00ff88] mb-1">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-1 overflow-hidden mt-auto">
                                    <p className="text-[9px] font-medium text-white/90 line-clamp-1 leading-tight">
                                        {slide.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {currentSlideIndex === index && (
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlideThumbnails;
