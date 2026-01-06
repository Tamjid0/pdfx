
import React, { useState, useRef } from 'react';

interface ImportChatProps {
    onImportUrl: (url: string) => void;
    onPasteContent: (content: string) => void;
    onFileUpload: (file: File) => void;
}

const ImportChat: React.FC<ImportChatProps> = ({ onImportUrl, onPasteContent, onFileUpload }) => {
    const [url, setUrl] = useState('');
    const [pastedContent, setPastedContent] = useState('');
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportUrl = () => {
        if (url) {
            onImportUrl(url);
            setIsUrlModalOpen(false);
        }
    };

    const handlePaste = () => {
        if (pastedContent) {
            onPasteContent(pastedContent);
            setIsPasteModalOpen(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (file) {
            onFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-5xl flex flex-col gap-6">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 text-white">Start Your Project</h2>
                <p className="text-base text-gemini-gray">Choose how you want to import your content</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gemini-dark-200 border-2 border-gemini-dark-400 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20" onClick={() => setIsUrlModalOpen(true)}>
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 fill-gemini-green" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">Import from URL</h3>
                    <p className="text-sm text-gemini-gray leading-relaxed">Paste a chat URL or conversation link to automatically import and format your content</p>
                </div>

                <div className="bg-gemini-dark-200 border-2 border-gemini-dark-400 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20" onClick={() => onPasteContent('')}>
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 fill-gemini-green" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">Paste Content</h3>
                    <p className="text-sm text-gemini-gray leading-relaxed">Directly paste your chat content, code snippets, or text to format and convert to PDF</p>
                </div>

                <div
                    className={`bg-gemini-dark-200 border-2 rounded-2xl p-10 cursor-pointer transition-all text-center hover:border-gemini-green hover:bg-gemini-dark-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gemini-green/20 ${isDragOver ? 'border-gemini-green bg-gemini-dark-300' : 'border-gemini-dark-400'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={openFilePicker}
                >
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gemini-green/10 to-gemini-green/5 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 fill-gemini-green" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">Upload File</h3>
                    <p className="text-sm text-gemini-gray leading-relaxed">Drag and drop your file here, or click to browse. Supports PDF, TXT, and MD files.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileInputChange}
                        accept=".pdf,.txt,.md"
                    />
                </div>
            </div>

            {isUrlModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[1000]">
                    <div className="bg-gemini-dark-200 border border-gemini-dark-500 rounded-2xl p-8 w-[90%] max-w-xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold text-white">Import from URL</h3>
                            <button className="bg-transparent border-none text-gemini-gray cursor-pointer p-1 transition-colors hover:text-gemini-green" onClick={() => setIsUrlModalOpen(false)}>
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-6">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Chat URL or Conversation Link</label>
                                <input type="url" className="w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10" id="chatUrl" placeholder="https://chat.example.com/conversation/123" value={url} onChange={(e) => setUrl(e.target.value)} />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Import Options</label>
                                <select className="w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10">
                                    <option>Full conversation</option>
                                    <option>Code blocks only</option>
                                    <option>Text only</option>
                                    <option>Custom selection</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="bg-gemini-dark-300 text-white border border-gemini-dark-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 hover:bg-[#252525]" onClick={() => setIsUrlModalOpen(false)}>Cancel</button>
                            <button className="bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px" onClick={handleImportUrl}>Import Chat</button>
                        </div>
                    </div>
                </div>
            )}

            {isPasteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[1000]">
                    <div className="bg-gemini-dark-200 border border-gemini-dark-500 rounded-2xl p-8 w-[90%] max-w-xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold text-white">Paste Content to Format</h3>
                            <button className="bg-transparent border-none text-gemini-gray cursor-pointer p-1 transition-colors hover:text-gemini-green" onClick={() => setIsPasteModalOpen(false)}>
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-6">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Paste Your Content Here</label>
                                <textarea className="w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10 min-h-[200px] resize-y font-sans" id="pastedContent" placeholder="Paste your chat content, code snippets, or any text here..." value={pastedContent} onChange={(e) => setPastedContent(e.target.value)}></textarea>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Auto-detect Format</label>
                                <select className="w-full px-4 py-3.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-gemini-green focus:bg-[#1f1f1f] focus:ring-3 focus:ring-gemini-green/10">
                                    <option>Automatic detection</option>
                                    <option>Plain text</option>
                                    <option>Markdown</option>
                                    <option>Code</option>
                                    <option>Mixed content</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="bg-gemini-dark-300 text-white border border-gemini-dark-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 hover:bg-[#252525]" onClick={() => setIsPasteModalOpen(false)}>Cancel</button>
                            <button className="bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px" onClick={handlePaste}>Format Content</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportChat;
