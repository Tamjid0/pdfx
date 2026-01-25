import React, { useMemo } from 'react';
import { PreviewRenderer } from '../DocumentPreview/PreviewRenderer';

interface ProjectStylePreviewPopupProps {
    mode: string;
    data: any;
    onClose: () => void;
}

const ProjectStylePreviewPopup: React.FC<ProjectStylePreviewPopupProps> = ({ mode, data, onClose }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="bg-[#111] border border-white/10 w-full max-w-4xl h-full max-h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="p-8 pb-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gemini-green/10 flex items-center justify-center border border-gemini-green/20">
                            <svg className="w-5 h-5 text-gemini-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight uppercase">Style Preview</h3>
                            <p className="text-[10px] font-bold text-gemini-gray uppercase tracking-widest mt-0.5">Mode: {mode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gemini-gray hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden bg-white/5 m-4 rounded-[1.5rem] border border-white/5 shadow-inner">
                    <PreviewRenderer mode={mode} data={data} />
                </div>

                {/* Footer Tip */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-center">
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gemini-green"></span>
                        <span className="text-[10px] font-bold text-gemini-gray uppercase tracking-widest">This is a live style simulation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStylePreviewPopup;
