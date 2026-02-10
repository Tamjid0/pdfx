import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getAuthHeaders } from '../services/apiService';
import SelectionOverlay from './slides/SelectionOverlay';
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
    const fileId = useStore(state => state.fileId);
    const setFileId = useStore(state => state.setFileId);
    const setFileType = useStore(state => state.setFileType);
    const setSlides = useStore(state => state.setSlides);
    const setCurrentSlideIndex = useStore(state => state.setCurrentSlideIndex);
    const currentSlideIndex = useStore(state => state.currentSlideIndex);
    const pdfSearchText = useStore(state => state.pdfSearchText);
    const setPdfSearchText = useStore(state => state.setPdfSearchText);
    const isDocumentLoading = useStore(state => state.isDocumentLoading);
    const setIsDocumentLoading = useStore(state => state.setIsDocumentLoading);
    const activeNodeIds = useStore(state => state.activeNodeIds);
    const setActiveNodeIds = useStore(state => state.setActiveNodeIds);
    const headersLoaded = useStore(state => state.headersLoaded);
    const setHeadersLoaded = useStore(state => state.setHeadersLoaded);
    const authHeaders = useStore(state => state.authHeaders);
    const setAuthHeaders = useStore(state => state.setAuthHeaders);
    const setActiveSelection = useStore(state => state.setActiveSelection);
    const activeSelection = useStore(state => state.activeSelection);

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState(1.0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [containerRect, setContainerRect] = useState<{ width: number; height: number } | null>(null);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [isSearchMinimized, setIsSearchMinimized] = useState(false);
    const [highlightedText, setHighlightedText] = useState<string | null>(null);
    const [documentStructure, setDocumentStructure] = useState<any>(null);
    const [activeNodeBoxes, setActiveNodeBoxes] = useState<any[] | null>(null);

    // Fetch auth headers for PDF retrieval
    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const headers = await getAuthHeaders();
                setAuthHeaders(headers);
            } finally {
                setHeadersLoaded(true);
            }
        };
        fetchHeaders();
    }, [fileId]);

    // Memoize the file object to prevent react-pdf from reloading unnecessarily
    const pdfFile = useMemo(() => {
        if (!fileId || !headersLoaded) return null;
        return {
            url: `/api/v1/documents/${fileId}/pdf`,
            httpHeaders: authHeaders
        };
    }, [fileId, authHeaders, headersLoaded]);

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
                navigator.clipboard.writeText(pdfSearchText);
            }

            // Highlighting triggers:
            // 1. Immediately (for when we're already on the correct page)
            const timer = setTimeout(() => {
                highlightTextInPDF(pdfSearchText);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [pdfSearchText]);

    // Fetch document structure for coordinate-based highlighting
    useEffect(() => {
        if (!fileId) return;

        const fetchStructure = async () => {
            try {
                const response = await fetch(`/api/v1/documents/${fileId}`, {
                    headers: authHeaders
                });
                const data = await response.json();
                if (data.structure) {
                    setDocumentStructure(data.structure);
                }
            } catch (error) {
                // Silent error in production
            }
        };

        if (headersLoaded) {
            fetchStructure();
        }
    }, [fileId, headersLoaded, authHeaders]);

    // Handle activeNodeIds changes - find nodes and navigate to them
    useEffect(() => {
        if (!activeNodeIds || activeNodeIds.length === 0 || !documentStructure) return;

        // Find the nodes in the document structure
        const foundNodes: { node: any, pageIndex: number }[] = [];

        // Handle potentially nested structure (Accessing document.structure.pages instead of document.pages)
        const pages = documentStructure.structure?.pages || documentStructure.pages || [];

        for (const page of pages) {
            // Find all nodes on this page that are in the active list
            const nodesOnPage = page.nodes?.filter((n: any) => activeNodeIds.includes(n.id));
            if (nodesOnPage && nodesOnPage.length > 0) {
                nodesOnPage.forEach((node: any) => {
                    foundNodes.push({ node, pageIndex: page.index });
                });
            }
        }

        if (foundNodes.length > 0) {
            // Navigate to the first node's page
            const firstNode = foundNodes[0];
            setPageNumber(firstNode.pageIndex + 1);
            setCurrentSlideIndex(firstNode.pageIndex);

            // Set the highlight box coordinates for ALL found nodes
            const boxes = foundNodes.map(item => ({
                x: item.node.position.x,
                y: item.node.position.y,
                width: item.node.position.width,
                height: item.node.position.height,
                pageIndex: item.pageIndex
            }));

            setActiveNodeBoxes(boxes);

            // Clear after 5 seconds
            const timer = setTimeout(() => {
                setActiveNodeBoxes(null);
                setActiveNodeIds(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [activeNodeIds, documentStructure, setCurrentSlideIndex, setActiveNodeIds]);

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

        const textLayer = document.querySelector('.react-pdf__Page__textContent');
        if (!textLayer) {
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
            applyHighlights(highlightedElements);
            return;
        }

        // Search failed
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
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsDocumentLoading(false);
    }

    const changePage = (offset: number) => {
        const newIndex = currentSlideIndex + offset;
        if (numPages && newIndex >= 0 && newIndex < numPages) {
            setCurrentSlideIndex(newIndex);
        }
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setScale(1.0);

    const handleSelectionComplete = (rect: { x: number, y: number, width: number, height: number }) => {
        if (!documentStructure) return;

        const pages = documentStructure.structure?.pages || documentStructure.pages || [];
        const currentPage = pages.find((p: any) => p.index === currentSlideIndex);

        if (!currentPage || !currentPage.nodes) return;

        const selectedNodes = currentPage.nodes.filter((node: any) => {
            if (!node.position) return false;

            // Robust Intersection Logic (Overlap Threshold)
            const x1 = Math.max(node.position.x, rect.x);
            const y1 = Math.max(node.position.y, rect.y);
            const x2 = Math.min(node.position.x + node.position.width, rect.x + rect.width);
            const y2 = Math.min(node.position.y + node.position.height, rect.y + rect.height);

            if (x2 > x1 && y2 > y1) {
                const intersectionArea = (x2 - x1) * (y2 - y1);
                const nodeArea = node.position.width * node.position.height;
                const rectArea = rect.width * rect.height;

                // Select if:
                // 1. Capture significant part of the node (> 20%)
                // 2. OR Selection is mostly inside the node (> 50%) - for small precision selects
                return (intersectionArea / nodeArea > 0.2) || (intersectionArea / rectArea > 0.5);
            }
            return false;
        });

        const textNodes = selectedNodes
            .filter((n: any) => n.type === 'text')
            .map((n: any) => typeof n.content === 'string' ? n.content : n.content?.text || "");

        const nodeIds = selectedNodes
            .filter((n: any) => n.type === 'text')
            .map((n: any) => n.id)
            .filter(Boolean);

        // Generate Text Preview (Start...End)
        const fullText = textNodes.join(' ');
        let textPreview = fullText;
        if (fullText.length > 50) {
            const start = fullText.slice(0, 20).trim();
            const end = fullText.slice(-20).trim();
            textPreview = `${start}...${end}`;
        }

        setActiveSelection({
            ...rect,
            pageIndex: currentSlideIndex,
            textNodes,
            nodeIds,
            textPreview
        });
    };

    if (!fileId) return null;

    return (
        <div className="document-viewer flex flex-col h-full bg-[#151515] relative animate-in fade-in duration-300 group">
            <style>{HIGHLIGHT_STYLE}</style>

            {/* Modern Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Floating Back button removed in favor of Top Header Back button */}
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
                    {containerRect && pdfFile && (
                        <Document
                            file={pdfFile}
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
                            {numPages && pageNumber >= 1 && pageNumber <= numPages && (
                                <div className="relative inline-block">
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        onRenderSuccess={onPageRenderSuccess}
                                        className="shadow-2xl border border-[#222] transition-transform duration-200"
                                    />

                                    <SelectionOverlay
                                        isActive={true}
                                        onSelectionComplete={handleSelectionComplete}
                                    />

                                    {/* Persistent Active Selection Box */}
                                    {activeSelection && activeSelection.pageIndex === pageNumber - 1 && (
                                        <div
                                            className="absolute pointer-events-none z-[70]"
                                            style={{
                                                left: `${activeSelection.x}%`,
                                                top: `${activeSelection.y}%`,
                                                width: `${activeSelection.width}%`,
                                                height: `${activeSelection.height}%`,
                                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                                border: '2px solid #00ff88',
                                                boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)'
                                            }}
                                        >
                                            <div className="absolute -top-6 left-0 bg-[#00ff88] text-black text-[10px] font-bold px-2 py-0.5 rounded-t-sm">
                                                SELECTED AREA
                                            </div>
                                        </div>
                                    )}


                                    {/* Coordinate-based Highlight Overlay (Multiple Boxes) */}
                                    {activeNodeBoxes && activeNodeBoxes.map((box, idx) => (
                                        box.pageIndex === pageNumber - 1 && (
                                            <div
                                                key={`highlight-${idx}`}
                                                className="absolute pointer-events-none"
                                                style={{
                                                    left: `${box.x}%`,
                                                    top: `${box.y - 1.8}%`, // Shift up more (was -1%)
                                                    width: `${box.width}%`,
                                                    height: `${box.height + 1.5}%`, // Expand height downwards (was +0.8%)
                                                    backgroundColor: 'rgba(0, 255, 136, 0.4)',
                                                    border: '3px solid #00ff88',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 0 30px rgba(0, 255, 136, 0.8), inset 0 0 20px rgba(0, 255, 136, 0.3)',
                                                    zIndex: 9999,
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </Document>
                    )}
                </div>
            </div>

        </div>
    );
};

export default DocumentViewer;
