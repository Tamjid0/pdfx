import React, { useState } from 'react';
import { Mode } from '../../store/types';
import { VersionTabs } from '../dashboard/VersionTabs';
import { StandardButton } from './StandardButton';
import GenerationScopeSelector from '../dashboard/GenerationScopeSelector';

interface ModeContainerProps {
    module: Mode;
    title: string;
    statusTitle?: string;
    isGenerating: boolean;
    hasData: boolean;
    onGenerate: (mode: Mode) => void;
    onExport: () => void;
    lastUpdated?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    additionalHeaderActions?: React.ReactNode;
    footerActions?: React.ReactNode;
}

export const ModeContainer: React.FC<ModeContainerProps> = ({
    module,
    title,
    statusTitle,
    isGenerating,
    hasData,
    onGenerate,
    onExport,
    lastUpdated,
    children,
    icon,
    additionalHeaderActions,
    footerActions
}) => {
    const [showRegenerateScope, setShowRegenerateScope] = useState(false);

    const defaultStatusTitle = hasData ? 'Analysis Ready' : 'System Idle';
    const currentStatus = statusTitle || defaultStatusTitle;

    return (
        <div className="flex flex-col h-full w-full bg-gemini-dark rounded-xl border border-gemini-dark-400 overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gemini-dark-400 bg-gemini-dark-200 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-4">
                    <div className="flex space-x-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-gemini-green animate-bounce' : 'bg-gemini-green/40'}`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-gemini-green animate-bounce' : 'bg-gemini-green/40'}`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-gemini-green animate-bounce' : 'bg-gemini-green/40'}`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-mono leading-none">
                            {currentStatus}
                        </h3>
                        {title && <span className="text-[8px] text-gemini-gray uppercase tracking-widest mt-1 font-bold">{title}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    {additionalHeaderActions}

                    <StandardButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowRegenerateScope(!showRegenerateScope)}
                        loading={isGenerating}
                        disabled={isGenerating}
                        icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                    >
                        {isGenerating ? 'SYNCING...' : (hasData ? 'REGENERATE' : 'SETUP')}
                    </StandardButton>

                    {showRegenerateScope && !isGenerating && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-gemini-dark-300 border border-gemini-dark-500 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Adjust Parameters</h4>
                                <button onClick={() => setShowRegenerateScope(false)} className="text-white/20 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <GenerationScopeSelector className="!space-y-4" />
                            <StandardButton
                                variant="primary"
                                size="md"
                                glow
                                onClick={() => {
                                    setShowRegenerateScope(false);
                                    onGenerate(module);
                                }}
                                className="w-full mt-8"
                            >
                                Confirm & {hasData ? 'Regenerate' : 'Generate'}
                            </StandardButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Version Navigation */}
            <VersionTabs module={module as any} />

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
                {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gemini-dark-200 border-t border-gemini-dark-400 flex justify-between items-center transition-all">
                <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-bold text-gemini-dark-500 uppercase tracking-widest font-mono">
                        {lastUpdated ? `Last Sync: ${lastUpdated}` : `System Status: Online`}
                    </p>
                    {hasData && (
                        <div className="flex gap-2 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gemini-green/20 animate-pulse"></span>
                            <span className="text-[8px] font-bold text-gemini-dark-500 uppercase">Live Vault Connection</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    {footerActions}
                    <StandardButton
                        variant="primary"
                        size="sm"
                        onClick={onExport}
                        disabled={!hasData || isGenerating}
                    >
                        EXPORT {module.toUpperCase()}
                    </StandardButton>
                </div>
            </div>
        </div>
    );
};
