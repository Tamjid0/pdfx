import React from 'react';
import GenerationScopeSelector from '../dashboard/GenerationScopeSelector';
import { StandardButton } from './StandardButton';

interface EmptyGenerationViewProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onGenerate: () => void;
    isGenerating: boolean;
    buttonLabel?: string;
}

export const EmptyGenerationView: React.FC<EmptyGenerationViewProps> = ({
    icon,
    title,
    description,
    onGenerate,
    isGenerating,
    buttonLabel = 'GENERATE'
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full text-center p-8 bg-gemini-dark rounded-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gemini-dark-300 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gemini-dark-500 shadow-inner group-hover:border-gemini-green/30 transition-colors">
                <div className="text-gemini-green drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                    {icon}
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-tight line-clamp-2">
                {title}
            </h3>

            <p className="text-gemini-gray mb-6 max-w-xs leading-relaxed text-sm line-clamp-2">
                {description}
            </p>

            <div className="w-full max-w-sm mb-6 bg-black/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                <GenerationScopeSelector className="!space-y-6" />
            </div>

            <StandardButton
                variant="primary"
                size="lg"
                glow
                onClick={onGenerate}
                loading={isGenerating}
                className="w-full max-w-[280px]"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            >
                {buttonLabel}
            </StandardButton>
        </div>
    );
};
