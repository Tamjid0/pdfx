import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentViewer: React.FC = () => {
    const {
        fileId,
        setFileId,
        setFileType,
        setSlides,
        setCurrentSlideIndex
    } = useStore();

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [scale, setScale] = useState(1.0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handleBackClick = () => {
        setShowExitConfirm(true);
    };

    const confirmExit = () => {
        setFileId(null);
        setFileType(null);
        setSlides([]);
        setCurrentSlideIndex(0);
        setShowExitConfirm(false);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    if (!fileId) return null;

    return (
        <div className="document-viewer flex flex-col h-full bg-[#151515] relative animate-in fade-in duration-300 group">

            {/* Modern Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-[#1a1a1a]/80 hover:border-[#00ff88]/30 rounded-full transition-all group/btn"
                    >
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-[#00ff88] group-hover/btn:text-black transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover/btn:text-white">Back to Editor</span>
                    </button>
                </div>

                {/* Page Controls - Centered/Right */}
                <div className="flex items-center gap-2 pointer-events-auto bg-[#1a1a1a]/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        className="p-1 hover:text-[#00ff88] disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-xs font-mono text-white/70">
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <button
                        disabled={pageNumber >= (numPages || 0)}
                        onClick={nextPage}
                        className="p-1 hover:text-[#00ff88] disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Main Content Area - React PDF */}
            <div className="flex-1 w-full h-full relative bg-[#0a0a0a] overflow-auto flex justify-center p-8 pt-20">
                <Document
                    file={`/api/v1/documents/${fileId}/pdf`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="shadow-2xl"
                    loading={
                        <div className="flex flex-col items-center gap-4 text-[#666]">
                            <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs uppercase tracking-widest">Loading PDF...</p>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center gap-4 text-[#ff4444]">
                            <p>Failed to load PDF.</p>
                            <a href={`/api/v1/documents/${fileId}/pdf`} download className="text-[#00ff88] hover:underline">Download File</a>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        width={800} // Fixed width container for now, or use resize observer later
                        className="shadow-2xl border border-[#222]"
                    />
                </Document>
            </div>

            {/* Confirmation Modal */}
            {showExitConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ring-1 ring-white/10">
                        <div className="flex items-center gap-3 mb-4 text-white">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold">End Session?</h3>
                        </div>

                        <p className="text-[#888] text-sm mb-6 leading-relaxed">
                            Are you sure you want to close this file? Your current interaction session will be ended.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white hover:bg-[#333] rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmExit}
                                className="px-4 py-2 text-sm font-bold bg-[#222] text-[#ff4444] border border-[#333] hover:bg-[#ff4444] hover:text-white hover:border-transparent rounded-xl transition-all shadow-lg"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;
