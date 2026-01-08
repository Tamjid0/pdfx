import React from 'react';
import { useStore } from '../../store/useStore';

const SlideThumbnails: React.FC = () => {
    const { slides, currentSlideIndex, setCurrentSlideIndex } = useStore();

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
                        <div className={`aspect-[16/9] w-full bg-[#1a1a1a] rounded-lg border flex flex-col p-3 transition-all duration-300 ${currentSlideIndex === index
                                ? 'border-[#00ff88] ring-1 ring-[#00ff88]/50 shadow-[0_0_15px_rgba(0,255,136,0.15)] bg-[#222]'
                                : 'border-[#333] hover:border-[#444] grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                            }`}>
                            <span className="text-[8px] font-bold text-[#666] mb-1 group-hover:text-[#00ff88] transition-colors">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-medium text-white/90 line-clamp-2 leading-tight">
                                    {slide.title}
                                </p>
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
