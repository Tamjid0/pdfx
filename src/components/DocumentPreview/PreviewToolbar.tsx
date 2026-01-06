import React, { useState } from 'react';
import { useStore, type PreviewPreset } from '../../store/useStore';

/**
 * PreviewToolbar
 * Controls for toggling preview mode and selecting presets
 */
export const PreviewToolbar: React.FC = () => {
    const { isPreviewMode, previewPreset, setPreviewMode, setPreviewPreset } = useStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const presets: { value: PreviewPreset; label: string; icon: string }[] = [
        { value: 'professional', label: 'Professional', icon: '💼' },
        { value: 'academic', label: 'Academic', icon: '🎓' },
        { value: 'minimal', label: 'Minimal', icon: '⚡' },
        { value: 'creative', label: 'Creative', icon: '🎨' },
    ];

    const currentPreset = presets.find(p => p.value === previewPreset) || presets[0];

    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#111] border-b border-[#222]">
            {/* Left: Preview Toggle */}
            <button
                onClick={() => setPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isPreviewMode
                    ? 'bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#222] hover:shadow-md'
                    }`}
                title="Toggle Document Preview (Cmd/Ctrl+P)"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isPreviewMode ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    )}
                </svg>
                <span>{isPreviewMode ? 'Preview' : 'Interactive'}</span>
            </button>

            {/* Center: Preset Dropdown (only visible in preview mode) */}
            {isPreviewMode && (
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-all border border-[#333]"
                    >
                        <span>{currentPreset.icon}</span>
                        <span>{currentPreset.label}</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
                            {presets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => {
                                        setPreviewPreset(preset.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${previewPreset === preset.value
                                        ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                        : 'text-gray-300 hover:bg-[#222] hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg">{preset.icon}</span>
                                    <span>{preset.label}</span>
                                    {previewPreset === preset.value && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Right: Export Button (only visible in preview mode) */}
            {isPreviewMode && (
                <button
                    onClick={() => {
                        const { openExportModal, summaryData, insightsData, notesData, quizData, flashcardsData } = useStore.getState();
                        // This logic should probably be in a helper or the store, 
                        // but for now we follow the pattern in Home.tsx
                        // Note: The parent component usually manages the mode, 
                        // but the toolbar doesn't know the mode currently.
                        // Actually, the PreviewToolbar is inside DocumentPreview which HAS the mode.
                        // But PreviewToolbar itself doesn't have it as a prop.
                        // For now, we'll assume the user wants to export whatever is currently being viewed.
                        // We need the 'mode' to know which data to send.
                        // I'll add 'mode' as a prop to PreviewToolbar.
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-all border border-[#333]"
                    title="Export document"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </button>
            )}
        </div>
    );
};
