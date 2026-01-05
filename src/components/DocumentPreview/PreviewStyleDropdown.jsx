'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\DocumentPreview\\PreviewStyleDropdown.tsx";import React, { useState } from 'react';
import { useStore, } from '../../store/useStore';

/**
 * PreviewStyleDropdown
 * Compact dropdown for selecting preview presets
 */
export const PreviewStyleDropdown = () => {
    const { previewPreset, setPreviewPreset } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const presets = [
        { value: 'professional', label: 'Professional', icon: '💼' },
        { value: 'academic', label: 'Academic', icon: '🎓' },
        { value: 'minimal', label: 'Minimal', icon: '⚡' },
        { value: 'creative', label: 'Creative', icon: '🎨' },
    ];

    const currentPreset = presets.find(p => p.value === previewPreset) || presets[0];

    return (
        React.createElement('div', { className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 22}}
            , React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                className: "flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#222] transition-all border border-[#333]"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}

                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}, currentPreset.icon)
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}, currentPreset.label)
                , React.createElement('svg', {
                    className: `w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`,
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}}

                    , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}} )
                )
            )

            , isOpen && (
                React.createElement('div', { className: "absolute top-full right-0 mt-2 w-44 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 40}}
                    , presets.map((preset) => (
                        React.createElement('button', {
                            key: preset.value,
                            onClick: () => {
                                setPreviewPreset(preset.value);
                                setIsOpen(false);
                            },
                            className: `w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all ${previewPreset === preset.value
                                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                    : 'text-gray-300 hover:bg-[#222] hover:text-white'
                                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}

                            , React.createElement('span', { className: "text-base", __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}, preset.icon)
                            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, preset.label)
                            , previewPreset === preset.value && (
                                React.createElement('svg', { className: "w-3.5 h-3.5 ml-auto"  , fill: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
                                    , React.createElement('path', { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}} )
                                )
                            )
                        )
                    ))
                )
            )
        )
    );
};
