
import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import { Editor as TiptapEditorClass } from '@tiptap/core';
import * as apiService from '../services/apiService';
import { useStore } from '../store/useStore';

interface EditorProps {
    onEditorChange: (html: string, text: string) => void;
    htmlContent: string | null;
    onFileUpload?: (file: File) => void;
    onPasteContent?: () => void;
}

const Editor: React.FC<EditorProps> = ({ htmlContent, onEditorChange, onFileUpload, onPasteContent }) => {
    const { setFileId } = useStore();
    const [editor, setEditor] = useState<TiptapEditorClass | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const [isPasting, setIsPasting] = useState(false);
    const [pastedText, setPastedText] = useState('');

    const handleConfirmPaste = async () => {
        if (pastedText && onEditorChange) {
            onEditorChange(`<p>${pastedText.replace(/\n/g, '</p><p>')}</p>`, pastedText);
            setIsPasting(false);

            // Background Embedding
            try {
                const data = await apiService.embedText(pastedText);
                if (data.fileId) {
                    setFileId(data.fileId);
                    console.log("[+] Pasted content embedded in background:", data.fileId);
                }
            } catch (err) {
                console.error("[-] Failed to embed pasted content in background", err);
            }

            setPastedText('');
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        // If there's a file in the clipboard, handle it as an upload
        const file = e.clipboardData.files?.[0];
        if (file && onFileUpload) {
            e.preventDefault();
            onFileUpload(file);
            return;
        }

        // If the editor is empty and text is pasted, handle it in our hub
        if (isEmpty && !isPasting) {
            const text = e.clipboardData.getData('text');
            if (text) {
                e.preventDefault();
                setIsPasting(true);
                setPastedText(text);
            }
        }
    };

    return (
        <div
            className={`editor-wrapper flex flex-col flex-1 h-full relative transition-all duration-300 ${isDragOver ? 'scale-[0.99] border-[#00ff88] ring-4 ring-[#00ff88]/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
        >
            {/* Modern Floating Toolbar */}
            {editor && !isEmpty && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-[#1a1a1a]/80 backdrop-blur-xl border border-[#333] rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bold') ? 'bg-[#00ff88] text-black' : 'text-white hover:bg-[#2a2a2a]'}`} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
                    </button>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('italic') ? 'bg-[#00ff88] text-black' : 'text-white hover:bg-[#2a2a2a]'}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m-9 0h8m-5 16h8" /></svg>
                    </button>
                    <div className="w-px h-6 bg-[#333] mx-1"></div>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-[#00ff88] text-black' : 'text-white hover:bg-[#2a2a2a]'}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <span className="text-xs font-black">H2</span>
                    </button>
                    <button className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-[#00ff88] text-black' : 'text-white hover:bg-[#2a2a2a]'}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <div className="w-px h-6 bg-[#333] mx-1"></div>
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-[#2a2a2a] transition-all" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M7 12h10M4 18h16" /></svg>
                    </button>
                </div>
            )}

            {/* Empty State / Start Hub */}
            {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-3xl border-2 border-dashed border-[#222] group hover:border-[#00ff88]/30 transition-all duration-500 overflow-hidden relative text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                        {!isPasting ? (
                            <>
                                <div className="w-24 h-24 mb-8 bg-[#111] rounded-[2rem] border border-[#222] flex items-center justify-center shadow-2xl group-hover:border-[#00ff88]/50 group-hover:shadow-[#00ff88]/10 transition-all duration-500 rotate-3 group-hover:rotate-0">
                                    <svg className="w-12 h-12 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to create?</h2>
                                <p className="text-gray-400 mb-10 leading-relaxed font-medium">
                                    Choose a starting point or just start typing. Drag and drop any file directly here to begin your transformation.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full px-4">
                                    <button
                                        onClick={handleFileClick}
                                        className="flex-1 px-6 py-4 bg-[#00ff88] text-black rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00ff88]/20 hover:scale-[1.03] active:scale-95 transition-all"
                                    >
                                        Upload File
                                    </button>
                                    <button
                                        onClick={() => setIsPasting(true)}
                                        className="flex-1 px-6 py-4 bg-[#111] text-white border border-[#333] rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-[#1a1a1a] hover:border-[#444] active:scale-95 transition-all"
                                    >
                                        Paste Content
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full animate-in zoom-in-95 duration-300">
                                <h2 className="text-2xl font-black text-white mb-6">Paste your content</h2>
                                <textarea
                                    autoFocus
                                    className="w-full h-48 p-6 bg-[#111] border border-[#333] rounded-3xl text-gray-200 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]/50 transition-all mb-6 resize-none font-sans text-sm"
                                    placeholder="Paste text here..."
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsPasting(false)}
                                        className="flex-1 px-6 py-3 bg-transparent text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmPaste}
                                        disabled={!pastedText.trim()}
                                        className="flex-[2] px-6 py-3 bg-[#00ff88] disabled:opacity-50 disabled:grayscale text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00ff88]/10 hover:scale-[1.02] transition-all"
                                    >
                                        Confirm & Start
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={onFileChange}
                            accept=".pdf,.txt,.md"
                        />

                        <div className="mt-12 flex items-center gap-2 text-[#444] text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                            Drop files anywhere to start
                        </div>
                    </div>
                </div>
            ) : (
                <div className="editor-content-container flex-1 bg-[#0a0a0a] rounded-3xl border border-[#222] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent"></div>
                    <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                        <TiptapEditor
                            htmlContent={htmlContent}
                            onEditorChange={onEditorChange}
                            onEditorCreated={setEditor}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;
