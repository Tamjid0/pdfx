import React, { useState } from 'react';
import { useStore, type PreviewPreset } from '../../store/useStore';

/**
 * PreviewStyleDropdown
 * Compact dropdown for selecting preview presets
 */
export const PreviewStyleDropdown: React.FC = () => {
    const { previewPreset, setPreviewPreset } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const presets: { value: PreviewPreset; label: string; icon: string }[] = [
        { value: 'professional', label: 'Professional', icon: '💼' },
        { value: 'academic', label: 'Academic', icon: '🎓' },
        { value: 'minimal', label: 'Minimal', icon: '⚡' },
        { value: 'creative', label: 'Creative', icon: '🎨' },
    ];

    const currentPreset = presets.find(p => p.value === previewPreset) || presets[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#222] transition-all border border-[#333]"
            >
                <span>{currentPreset.icon}</span>
                <span>{currentPreset.label}</span>
                <svg
                    className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => {
                                setPreviewPreset(preset.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all ${previewPreset === preset.value
                                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                    : 'text-gray-300 hover:bg-[#222] hover:text-white'
                                }`}
                        >
                            <span className="text-base">{preset.icon}</span>
                            <span>{preset.label}</span>
                            {previewPreset === preset.value && (
                                <svg className="w-3.5 h-3.5 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
