import React, { useState, useEffect } from 'react';
import TiptapEditor from './TiptapEditor';
import { Editor as TiptapEditorClass } from '@tiptap/core';
import * as apiService from '../services/apiService';
import { useStore } from '../store/useStore';
import dynamic from 'next/dynamic';

const DocumentViewer = dynamic(() => import('./DocumentViewer'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full text-[#666]">
            <p className="text-xs uppercase tracking-widest">Loading Viewer...</p>
        </div>
    )
});

interface EditorProps {
    onEditorChange: (html: string, text: string) => void;
    htmlContent: string | null;
    onFileUpload?: (file: File) => void;
    onPasteContent?: () => void;
}

const Editor: React.FC<EditorProps> = ({ htmlContent, onEditorChange, onFileUpload, onPasteContent }) => {
    const { setFileId, fileType, fileId } = useStore();
    const [editor, setEditor] = useState<TiptapEditorClass | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // If a document is active, we don't show the text editor in the first pane
    if (fileId) {
        if (fileType === 'pdf') return <DocumentViewer />;
        // For slides, MainLayout handles showing SlidePipelineContainer based on leftPanelView
        return null;
    }

    const isEmpty = !htmlContent || htmlContent === '<p></p>' || htmlContent === '';

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        // If there's a file in the clipboard (Shift+Ctrl+V or similar), handle it as an upload
        const file = e.clipboardData.files?.[0];
        if (file && onFileUpload) {
            e.preventDefault();
            onFileUpload(file);
            return;
        }

        // Otherwise, let Tiptap handle the text paste naturally
    };

    return (
        <div
            className={`editor-wrapper flex flex-col flex-1 h-full relative transition-all duration-300 ${isDragOver ? 'scale-[0.99] border-[#00ff88] ring-4 ring-[#00ff88]/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
        >
            {/* Modern Floating Toolbar - Only show when has content */}
            {editor && !isEmpty && isMounted && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-gemini-dark-300/80 backdrop-blur-xl border border-gemini-dark-500 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bold') ? 'bg-gemini-green text-black' : 'text-white hover:bg-gemini-dark-400'}`} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
                    </button>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('italic') ? 'bg-gemini-green text-black' : 'text-white hover:bg-gemini-dark-400'}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m-9 0h8m-5 16h8" /></svg>
                    </button>
                    <div className="w-px h-6 bg-gemini-dark-500 mx-1"></div>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-gemini-green text-black' : 'text-white hover:bg-gemini-dark-400'}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <span className="text-xs font-black">H2</span>
                    </button>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-gemini-green text-black' : 'text-white hover:bg-gemini-dark-400'}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <div className="w-px h-6 bg-gemini-dark-500 mx-1"></div>
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-gemini-dark-400 transition-all" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M7 12h10M4 18h16" /></svg>
                    </button>
                </div>
            )}

            <div className="editor-content-container flex-1 bg-gemini-dark-200 rounded-3xl border border-gemini-dark-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ring-1 ring-white/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-green/20 to-transparent"></div>

                {/* Subtle Empty State Placeholder */}
                {isEmpty && isMounted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Background guide (non-interactive) */}
                        <div className="flex flex-col items-center opacity-20 group-hover:opacity-30 transition-opacity">
                            <div className="w-20 h-20 mb-6 bg-gemini-dark-400 rounded-[2rem] border border-gemini-dark-500 flex items-center justify-center">
                                <svg className="w-10 h-10 text-gemini-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gemini-gray font-black uppercase tracking-[0.3em] text-[10px] transition-colors mb-8">
                                Paste content or drop files here
                            </p>
                        </div>

                        {/* Interactive Upload Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFileClick();
                            }}
                            className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-gemini-dark-400 border border-gemini-dark-500 text-gemini-green rounded-2xl font-black text-xs uppercase tracking-widest hover:border-gemini-green/50 hover:bg-gemini-dark-300 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload file
                        </button>
                    </div>
                )}

                <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-10">
                    {/* Localized Watermark @ Cursor Position */}
                    {isEmpty && (
                        <div className="absolute top-8 md:top-12 left-8 md:left-12 pointer-events-none select-none">
                            <span className="text-gemini-green/30 font-medium text-lg italic animate-pulse">
                                Start typing here...
                            </span>
                        </div>
                    )}

                    <TiptapEditor
                        htmlContent={htmlContent}
                        onEditorChange={onEditorChange}
                        onEditorCreated={setEditor}
                    />
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileChange}
                accept=".pdf,.txt,.md"
            />
        </div>
    );
};

export default Editor;
