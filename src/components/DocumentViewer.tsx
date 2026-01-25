import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const HIGHLIGHT_STYLE = `
    .pdf-highlight {
        background-color: rgba(0, 255, 136, 0.4) !important;
        color: transparent !important;
        border-radius: 2px !important;
        outline: 2px solid #00ff88 !important;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5) !important;
        z-index: 1000 !important;
    }
    
    .react-pdf__Page__textContent {
        opacity: 1 !important;
        z-index: 10 !important;
        pointer-events: auto !important;
        user-select: text !important;
    }

    .react-pdf__Page__textContent span {
        background: transparent !important;
        color: transparent !important;
    }

    .document-viewer .z-50 {
        z-index: 90 !important;
        pointer-events: auto !important;
    }

    .search-box-transition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

const DocumentViewer: React.FC = () => {
    const {
        fileId,
        setFileId,
        setFileType,
        setSlides,
        setCurrentSlideIndex,
        currentSlideIndex,
        pdfSearchText,
        setPdfSearchText,
        isDocumentLoading,
        setIsDocumentLoading
    } = useStore();

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [scale, setScale] = useState(1.0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [containerRect, setContainerRect] = useState<{ width: number; height: number } | null>(null);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [isSearchMinimized, setIsSearchMinimized] = useState(false);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerRect({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        observer.observe(containerRef);
        return () => observer.disconnect();
    }, [containerRef]);

    // Sync with external page control (e.g. from Chat citations)
    // currentSlideIndex is 0-based, PDF pageNumber is 1-based
    useEffect(() => {
        if (currentSlideIndex >= 0) {
            setPageNumber(currentSlideIndex + 1);
        }
    }, [currentSlideIndex]);

    // Show search box and highlight text when citation with quoted text is clicked
    useEffect(() => {
        if (pdfSearchText) {
            setShowSearchBox(true);
            setIsSearchMinimized(false);
            setHighlightedText(pdfSearchText);

            // Copy to clipboard for easy Ctrl+F search
            if (navigator.clipboard) {
                navigator.clipboard.writeText(pdfSearchText).catch(err => {
                    console.warn('Failed to copy to clipboard:', err);
                });
            }

            // Highlighting triggers:
            // 1. Immediately (for when we're already on the correct page)
            const timer = setTimeout(() => {
                highlightTextInPDF(pdfSearchText);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [pdfSearchText]);

    const onPageRenderSuccess = () => {
        if (pdfSearchText) {
            highlightTextInPDF(pdfSearchText);
        }
    };

    // Helper to normalize problematic characters (ligatures, smart quotes, etc.)
    const normalizeChar = (c: string): string => {
        const ligatures: { [key: string]: string } = {
            '\uFB00': 'ff', '\uFB01': 'fi', '\uFB02': 'fl', '\uFB03': 'ffi', '\uFB04': 'ffl',
            '\uFB05': 'ft', '\uFB06': 'st'
        };
        const symbols: { [key: string]: string } = {
            '\u201C': '"', '\u201D': '"', '\u2018': "'", '\u2019': "'",
            '\u2013': '-', '\u2014': '-'
        };
        return ligatures[c] || symbols[c] || c;
    };

    const highlightTextInPDF = (searchText: string) => {
        if (!searchText) return;

        console.log('🔍 [PDF Search] Attempting to match:', searchText);

        const textLayer = document.querySelector('.react-pdf__Page__textContent');
        if (!textLayer) {
            console.warn('❌ [PDF Search] Text layer not found');
            return;
        }

        const spans = textLayer.querySelectorAll('span');

        // 1. Build character map with normalization
        const charMap: Array<{ char: string, element: HTMLElement }> = [];
        spans.forEach(span => {
            const element = span as HTMLElement;
            element.classList.remove('pdf-highlight');
            const text = element.textContent || '';
            for (const char of text) {
                const normalized = normalizeChar(char).toLowerCase();
                for (const n of normalized) {
                    charMap.push({ char: n, element });
                }
            }
        });

        const fullPageText = charMap.map(c => c.char).join('');

        const cleanQuery = (text: string) => text.toLowerCase()
            .split('').map(normalizeChar).join('')
            .replace(/["'“”‘’]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        const normalizedSearch = cleanQuery(searchText);

        // Match Strategy Pipeline
        const normalizedPageText = fullPageText.replace(/\s+/g, ' ');
        const matchIndex = normalizedPageText.indexOf(normalizedSearch);

        if (matchIndex !== -1) {
            const highlightedElements = new Set<HTMLElement>();
            let currentNormalizedPos = 0;
            let lastCharWasSpace = false;

            for (let i = 0; i < charMap.length; i++) {
                const isSpace = /\s/.test(charMap[i].char);
                if (isSpace) {
                    if (!lastCharWasSpace) currentNormalizedPos++;
                    lastCharWasSpace = true;
                } else {
                    if (currentNormalizedPos >= matchIndex && currentNormalizedPos < matchIndex + normalizedSearch.length) {
                        highlightedElements.add(charMap[i].element);
                    }
                    currentNormalizedPos++;
                    lastCharWasSpace = false;
                }
                if (currentNormalizedPos >= matchIndex + normalizedSearch.length) break;
            }
            console.log('✅ [PDF Search] Match found (Exact)');
            applyHighlights(highlightedElements);
            return;
        }

        const searchTerms = normalizedSearch.split(' ').filter(w => w.length > 0);
        const semanticPattern = searchTerms
            .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^a-z0-9]+');

        try {
            const regex = new RegExp(semanticPattern, 'i');
            const match = fullPageText.match(regex);

            if (match) {
                const highlightedElements = new Set<HTMLElement>();
                const startIndex = fullPageText.indexOf(match[0]);
                const endIndex = startIndex + match[0].length;
                for (let i = startIndex; i < endIndex && i < charMap.length; i++) {
                    highlightedElements.add(charMap[i].element);
                }
                console.log('✅ [PDF Search] Match found (Semantic)');
                applyHighlights(highlightedElements);
                return;
            }
        } catch (e) { }

        const importantWords = searchTerms.filter(w => w.length > 3);
        if (importantWords.length > 0) {
            const clusterSpans = new Set<HTMLElement>();
            let foundWords = 0;

            importantWords.forEach(word => {
                if (fullPageText.includes(word)) {
                    foundWords++;
                    spans.forEach(span => {
                        if (span.textContent?.toLowerCase().includes(word)) {
                            clusterSpans.add(span as HTMLElement);
                        }
                    });
                }
            });

            if (foundWords >= Math.min(2, importantWords.length)) {
                console.log(`✅ [PDF Search] Match found (Cluster - ${foundWords} words)`);
                applyHighlights(clusterSpans);
                return;
            }
        }

        const pageCharsOnly = charMap.filter(c => /[a-z0-9]/.test(c.char)).map(c => c.char).join('');
        const searchCharsOnly = normalizedSearch.replace(/[^a-z0-9]/g, '');
        const charMatchIndex = pageCharsOnly.indexOf(searchCharsOnly);

        if (charMatchIndex !== -1 && searchCharsOnly.length > 5) {
            const highlightedElements = new Set<HTMLElement>();
            let alphaCounter = 0;
            let matchedCount = 0;
            let startMatching = false;
            for (let i = 0; i < charMap.length; i++) {
                if (/[a-z0-9]/.test(charMap[i].char)) {
                    if (alphaCounter === charMatchIndex) startMatching = true;
                    if (startMatching) {
                        highlightedElements.add(charMap[i].element);
                        matchedCount++;
                    }
                    alphaCounter++;
                    if (matchedCount === searchCharsOnly.length) break;
                } else if (startMatching) highlightedElements.add(charMap[i].element);
            }
            console.log('✅ [PDF Search] Match found (Literal)');
            applyHighlights(highlightedElements);
            return;
        }

        console.error('❌ [PDF Search] Search failed for:', normalizedSearch);
    };

    const applyHighlights = (elements: Set<HTMLElement>) => {
        let first = true;
        elements.forEach(el => {
            el.classList.add('pdf-highlight');
            if (first) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                first = false;
            }
        });
        console.log(`🎨 [PDF Search] Highlighting applied to ${elements.size} spans`);
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsDocumentLoading(false);
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

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setScale(1.0);

    if (!fileId) return null;

    return (
        <div className="document-viewer flex flex-col h-full bg-[#151515] relative animate-in fade-in duration-300 group">
            <style>{HIGHLIGHT_STYLE}</style>

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

                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-[#1a1a1a]/40 backdrop-blur-md p-1 rounded-full border border-white/10 ring-1 ring-white/5">
                        <button
                            onClick={zoomOut}
                            className="p-1.5 hover:text-[#00ff88] transition-colors rounded-full hover:bg-white/5"
                            title="Zoom Out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <button
                            onClick={resetZoom}
                            className="px-2 text-[10px] font-mono text-white/70 hover:text-white transition-colors"
                            title="Reset Zoom"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            onClick={zoomIn}
                            className="p-1.5 hover:text-[#00ff88] transition-colors rounded-full hover:bg-white/5"
                            title="Zoom In"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>

                    {/* Page Controls */}
                    <div className="flex items-center gap-2 bg-[#1a1a1a]/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ring-1 ring-white/5">
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
            </div>

            {/* Floating Search Box - Appears when citation is clicked */}
            {showSearchBox && pdfSearchText && (
                <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in duration-200 search-box-transition ${isSearchMinimized ? 'min-w-0 opacity-80' : 'min-w-[400px]'}`}>
                    <div className={`bg-[#1a1a1a]/95 backdrop-blur-md border border-[#00ff88]/30 rounded-xl shadow-2xl overflow-hidden ${isSearchMinimized ? 'p-1' : 'p-4'}`}>
                        {isSearchMinimized ? (
                            <div className="flex items-center gap-2 px-2 py-1">
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-widest">Active Highlight</span>
                                <button
                                    onClick={() => setIsSearchMinimized(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                                    title="Restore Search Box"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 4l5-5m11 1v4m0 0h-4m4-4l-5 5" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-xs font-bold text-[#00ff88] uppercase tracking-wider">Search in PDF</span>
                                    </div>
                                    <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-3 mb-2">
                                        <p className="text-sm text-white/90 italic">"{pdfSearchText}"</p>
                                    </div>
                                    <p className="text-xs text-white/50 mb-3">
                                        Press <kbd className="px-1.5 py-0.5 bg-[#333] rounded text-[#00ff88] font-mono">Ctrl+F</kbd> (or <kbd className="px-1.5 py-0.5 bg-[#333] rounded text-[#00ff88] font-mono">⌘+F</kbd>) to search for this text in the PDF
                                    </p>
                                    <button
                                        onClick={() => highlightTextInPDF(pdfSearchText)}
                                        className="w-full py-1.5 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-xs font-bold hover:bg-[#00ff88]/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Re-highlight Text
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => setIsSearchMinimized(true)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                                        title="Minimize search box"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSearchBox(false);
                                            setPdfSearchText('');
                                            useStore.getState().setPdfSearchText('');
                                            const layer = document.querySelector('.react-pdf__Page__textContent');
                                            if (layer) {
                                                layer.querySelectorAll('.pdf-highlight').forEach(el => el.classList.remove('pdf-highlight'));
                                            }
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group/close"
                                        title="Close search"
                                    >
                                        <svg className="w-5 h-5 text-white/50 group-hover/close:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area - React PDF */}
            <div className="flex-1 w-full h-full relative bg-[#0a0a0a] overflow-auto flex justify-center items-start p-8">
                <div ref={setContainerRef} className="min-w-full flex items-start justify-center">
                    {containerRect && (
                        <Document
                            file={`/api/v1/documents/${fileId}/pdf`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="flex items-center justify-center"
                            loading={
                                <div className="flex flex-col items-center gap-6 py-20 animate-in fade-in duration-700">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 rounded-full border border-white/5"></div>
                                        <div className="absolute inset-0 rounded-full border border-t-gemini-green border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                        <div className="absolute -inset-2 bg-gemini-green/5 blur-xl rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Rendering Document</span>
                                    </div>
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
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                onRenderSuccess={onPageRenderSuccess}
                                className="shadow-2xl border border-[#222] transition-transform duration-200"
                            />
                        </Document>
                    )}
                </div>
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
