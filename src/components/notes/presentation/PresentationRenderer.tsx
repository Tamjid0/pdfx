import React, { useState } from 'react';
import { ScriptZone } from './ScriptZone';
import { DeliveryZone } from './DeliveryZone';
import { DeepDiveZone } from './DeepDiveZone';

interface Slide {
    title: string;
    script: string;
    delivery: string[];
    deep_dive: any[];
    timing?: string;
}

interface PresentationData {
    title?: string;
    subtitle?: string;
    slides: Slide[];
}

interface PresentationRendererProps {
    data: PresentationData;
}

export const PresentationRenderer: React.FC<PresentationRendererProps> = ({ data }) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const slides = data.slides || [];

    if (slides.length === 0) return <div className="text-white p-8">No slides generated.</div>;

    const activeSlide = slides[activeSlideIndex];

    return (
        <div className="presentation-container max-w-[1200px] mx-auto font-sans bg-[#0a0a0a] min-h-[80vh] flex flex-col">

            {/* Header */}
            <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{data.title || "Presentation Deck"}</h1>
                {data.subtitle && <p className="text-[#00ff88] text-sm uppercase tracking-[0.3em]">{data.subtitle}</p>}
            </div>

            {/* Slide Navigation (Tabs) */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 px-4 custom-scrollbar snap-x">
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSlideIndex(index)}
                        className={`flex-shrink-0 snap-start px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${activeSlideIndex === index
                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105'
                                : 'bg-[#1a1a1a] text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span className="mr-2 opacity-50">#{index + 1}</span>
                        {slide.title.replace(/^Slide \d+:\s*/, '')}
                    </button>
                ))}
            </div>

            {/* Active Slide Content */}
            <div className="flex-1 animate-in fade-in zoom-in-sm duration-300 px-4" key={activeSlideIndex}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left Column: Script */}
                    <div className="h-full">
                        <ScriptZone content={activeSlide.script} timing={activeSlide.timing} />
                    </div>

                    {/* Right Column: Delivery */}
                    <div className="h-full">
                        <DeliveryZone items={activeSlide.delivery} />
                    </div>
                </div>

                {/* Bottom Row: Deep Dive */}
                {activeSlide.deep_dive && activeSlide.deep_dive.length > 0 && (
                    <div className="mb-10">
                        <DeepDiveZone items={activeSlide.deep_dive} />
                    </div>
                )}
            </div>
        </div>
    );
};
