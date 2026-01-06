
import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import { Editor as TiptapEditorClass } from '@tiptap/core';

interface EditorProps {
    onEditorChange: (html: string, text: string) => void;
    htmlContent: string | null;
}

const Editor: React.FC<EditorProps> = ({ htmlContent, onEditorChange }) => {
    const [editor, setEditor] = useState<TiptapEditorClass | null>(null);

    // Helper type for buttons to avoid implicit any in map
    type ToolbarButton = {
        title: string;
        label?: string | React.ReactNode;
        action: () => boolean | void;
        // icon could be added here if we were generating SVGs dynamically
    };

    return (
        <div className="editor-container flex flex-col flex-1 bg-white rounded-xl shadow-lg h-full">
            <div className="editor-toolbar bg-gray-100 px-4 py-3 border-b border-gray-200 flex gap-1 flex-wrap">
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
                <div className="toolbar-separator w-px h-8 bg-gray-300 mx-1"></div>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                </button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Numbered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                    </svg>
                </button>
                <div className="toolbar-separator w-px h-8 bg-gray-300 mx-1"></div>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Align Left" onClick={() => editor?.chain().focus().setTextAlign('left').run()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                    </svg>
                </button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Align Center" onClick={() => editor?.chain().focus().setTextAlign('center').run()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                    </svg>
                </button>
                <button className="toolbar-btn w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all font-semibold text-sm text-gray-700 hover:bg-gray-200 hover:border-[#00ff88]" title="Align Right" onClick={() => editor?.chain().focus().setTextAlign('right').run()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                    </svg>
                </button>
            </div>
            <div className="editor-content p-8 text-base leading-relaxed text-gray-700 outline-none flex-1 overflow-y-auto">
                <TiptapEditor
                    htmlContent={htmlContent}
                    onEditorChange={onEditorChange}
                    onEditorCreated={setEditor}
                />
            </div>
        </div>
    );
};

export default Editor;
