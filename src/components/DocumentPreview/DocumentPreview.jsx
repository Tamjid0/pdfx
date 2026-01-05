'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\DocumentPreview\\DocumentPreview.tsx";import React from 'react';
import { useStore } from '../../store/useStore';
import { PreviewRenderer } from './PreviewRenderer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';






/**
 * DocumentPreview
 * Main container that switches between interactive mode and preview mode
 */
export const DocumentPreview = ({ mode, children }) => {
    const {
        isPreviewMode,
        setPreviewMode,
        summaryData,
        insightsData,
        notesData,
        quizData,
        flashcardsData
    } = useStore();

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onTogglePreview: () => {
            const supportedModes = ['summary', 'insights', 'notes', 'quiz', 'flashcards'];
            if (supportedModes.includes(mode)) {
                setPreviewMode(!isPreviewMode);
            }
        }
    });

    // Get current mode data
    const getModeData = () => {
        switch (mode) {
            case 'summary':
                return summaryData;
            case 'insights':
                return insightsData;
            case 'notes':
                return notesData;
            case 'quiz':
                return quizData;
            case 'flashcards':
                return flashcardsData;
            default:
                return null;
        }
    };

    const currentData = getModeData();

    // Don't show preview for modes that don't support it
    const supportedModes = ['summary', 'insights', 'notes', 'quiz', 'flashcards'];
    if (!supportedModes.includes(mode)) {
        return React.createElement(React.Fragment, null, children);
    }

    return (
        React.createElement('div', { className: "flex flex-col h-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
            /* Content Area */
            , React.createElement('div', { className: "flex-1 overflow-hidden relative bg-[#0a0a0a]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
                /* Interactive Mode */
                , React.createElement('div', {
                    className: `absolute inset-0 transition-all duration-500 ease-out ${isPreviewMode
                        ? 'opacity-0 pointer-events-none scale-95'
                        : 'opacity-100 scale-100'
                        }`,
                    style: {
                        transitionProperty: 'opacity, transform',
                        transformOrigin: 'center'
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}

                    , children
                )

                /* Preview Mode */
                , React.createElement('div', {
                    className: `absolute inset-0 transition-all duration-500 ease-out ${isPreviewMode
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 pointer-events-none scale-95'
                        }`,
                    style: {
                        transitionProperty: 'opacity, transform',
                        transformOrigin: 'center'
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}

                    , React.createElement(PreviewRenderer, { mode: mode, data: currentData, __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}} )
                )

                /* Floating Export Button (only in preview mode) */
                , isPreviewMode && (
                    React.createElement('div', { className: "absolute bottom-6 right-6 z-50 animate-slideInRight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}
                        , React.createElement('button', {
                            className: "group flex items-center gap-3 px-5 py-3 bg-[#00ff88] text-black rounded-full font-bold text-sm shadow-2xl hover:shadow-[#00ff88]/40 hover:scale-105 transition-all duration-300 border-2 border-[#00ff88]"                 ,
                            title: "Export document" ,
                            onClick: () => {
                                const currentData = getModeData();
                                if (currentData) {
                                    const { openExportModal } = useStore.getState();
                                    openExportModal(mode , currentData);
                                }
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}

                            , React.createElement('svg', { className: "w-5 h-5" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
                                , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"                     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}} )
                            )
                            , React.createElement('span', { className: "font-black", __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}, "Export")
                        )
                    )
                )
            )
        )
    );
};
