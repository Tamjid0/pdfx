import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import StaticSlideRenderer from './StaticSlideRenderer';
import SelectionOverlay from './SelectionOverlay';
import { getAuthHeaders } from '../../services/apiService';

const IconChevronLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const IconChevronRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const SlideViewer: React.FC = () => {
    const {
        currentSlideIndex,
        setCurrentSlideIndex,
        slides,
        fileId,
        isProcessingSlides,
        renderingProgress,
        nextSlide,
        prevSlide,
        isSlideMode,
        activeNodeIds,
        setActiveNodeIds,
        activeSelection,
        setActiveSelection
    } = useStore();
    const currentSlide = slides[currentSlideIndex];

    const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
    const [documentStructure, setDocumentStructure] = useState<any>(null);
    const [activeNodeBoxes, setActiveNodeBoxes] = useState<any[] | null>(null);

    // 1. Fetch Auth Headers
    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const headers = await getAuthHeaders();
                setAuthHeaders(headers);
            } catch (err) {
                console.error("Failed to fetch auth headers for slides");
            }
        };
        fetchHeaders();
    }, [fileId]);

    // 2. Fetch Document Structure for Coordinates
    useEffect(() => {
        if (!fileId || !authHeaders['Authorization']) return;

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
                console.error("Failed to fetch document structure for highlights", error);
            }
        };
        fetchStructure();
    }, [fileId, authHeaders]);

    // 3. Map activeNodeIds to Bounding Boxes
    useEffect(() => {
        if (!activeNodeIds || activeNodeIds.length === 0 || !documentStructure) return;

        const foundNodes: { node: any, pageIndex: number }[] = [];
        // Handle potentially nested structure
        const pages = documentStructure.structure?.pages || documentStructure.pages || [];

        for (const page of pages) {
            const nodesOnPage = page.nodes?.filter((n: any) => activeNodeIds.includes(n.id));
            if (nodesOnPage && nodesOnPage.length > 0) {
                nodesOnPage.forEach((node: any) => {
                    foundNodes.push({ node, pageIndex: page.index });
                });
            }
        }

        if (foundNodes.length > 0) {
            // Auto-navigate to first found slide
            const firstNode = foundNodes[0];
            setCurrentSlideIndex(firstNode.pageIndex);

            // Create boxes
            const boxes = foundNodes.map(item => ({
                x: item.node.position.x,
                y: item.node.position.y,
                width: item.node.position.width,
                height: item.node.position.height,
                pageIndex: item.pageIndex
            }));

            setActiveNodeBoxes(boxes);

            // Auto-clear
            const timer = setTimeout(() => {
                setActiveNodeBoxes(null);
                setActiveNodeIds(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [activeNodeIds, documentStructure, setCurrentSlideIndex, setActiveNodeIds]);

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
                // 2. OR Selection is mostly inside the node (> 50%)
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

        // Generate Text Preview
        const fullText = textNodes.join(' ');
        const textPreview = fullText.length > 40
            ? fullText.slice(0, 40) + '...'
            : fullText;

        setActiveSelection({
            ...rect,
            pageIndex: currentSlideIndex,
            textNodes,
            nodeIds,
            textPreview
        });
    };


    if (!currentSlide && !isSlideMode && !isProcessingSlides) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#666]">
                <p className="text-lg">No slides loaded</p>
            </div>
        );
    }

    return (
        <div className="slide-viewer flex flex-col h-full bg-[#0a0a0a] relative group overflow-hidden animate-in fade-in duration-500">
            {/* Loading Overlay for Background Processing */}
            {isProcessingSlides && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-xl animate-in fade-in duration-700">
                    <div className="relative w-32 h-32 mb-8">
                        {/* Outer Glow Ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#00ff88]/10 animate-[ping_3s_infinite]" />
                        {/* Progress Circle */}
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="transparent"
                                stroke="#00ff88"
                                strokeWidth="4"
                                strokeDasharray={377}
                                strokeDashoffset={377 - (377 * renderingProgress) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        {/* Percentage Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white font-mono">
                                {Math.round(renderingProgress)}%
                            </span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
                        Optimizing Your Slides
                    </h3>
                    <p className="text-[#888] text-center max-w-md px-8 leading-relaxed">
                        We're converting your presentation for a high-fidelity experience.
                        <br />
                        <span className="text-[#00ff88]/80 mt-2 block font-medium">
                            Feel free to start chatting with the document content right now!
                        </span>
                    </p>

                    <div className="mt-12 flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                        <span className="text-xs font-medium text-[#ccc] uppercase tracking-widest">
                            Processing Backend Queue
                        </span>
                    </div>
                </div>
            )}

            {/* Main Slide Area */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <div className="slide-content-container aspect-[16/9] w-full max-w-[950px] bg-[#1a1a1a] rounded-xl border border-[#333] shadow-2xl relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:border-[#00ff88]/30">

                    {fileId && !isProcessingSlides ? (
                        // HIGH FIDELITY STATIC PAGE
                        <div className="w-full h-full relative group/pdf overflow-hidden flex items-center justify-center">
                            <StaticSlideRenderer
                                documentId={fileId}
                                pageNumber={currentSlideIndex + 1}
                                priority={true}
                                className="shadow-lg"
                            />

                            {/* SELECTION OVERLAY LAYER */}
                            <SelectionOverlay
                                isActive={true}
                                onSelectionComplete={handleSelectionComplete}
                            />

                            {/* Persistent Active Selection Box */}
                            {activeSelection && activeSelection.pageIndex === currentSlideIndex && (
                                <div
                                    className="absolute pointer-events-none z-[55]"
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

                            {/* HIGHLIGHT OVERLAY LAYER */}
                            {activeNodeBoxes && activeNodeBoxes.map((box, idx) => (
                                box.pageIndex === currentSlideIndex && (
                                    <div
                                        key={`slide-highlight-${idx}`}
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: `${box.x}%`,
                                            top: `${box.y}%`,
                                            width: `${box.width}%`,
                                            height: `${box.height}%`,
                                            backgroundColor: 'rgba(0, 255, 136, 0.4)',
                                            border: '2px solid #00ff88',
                                            borderRadius: '2px', // Sharper corners for text
                                            boxShadow: '0 0 15px rgba(0, 255, 136, 0.6), inset 0 0 10px rgba(0, 255, 136, 0.2)',
                                            zIndex: 50, // Above image, below controls
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                        }}
                                    />
                                )
                            ))}


                            {/* Preload Next Slide */}
                            {currentSlideIndex < slides.length - 1 && (
                                <div style={{ display: 'none' }}>
                                    <StaticSlideRenderer
                                        documentId={fileId}
                                        pageNumber={currentSlideIndex + 2}
                                        priority={false}
                                    />
                                </div>
                            )}

                            {/* Visual Overlay - transparent border to maintain card aesthetic */}
                            <div className="absolute inset-0 pointer-events-none border-4 border-[#1a1a1a] rounded-xl ring-1 ring-[#333]/50" />
                        </div>
                    ) : (
                        // CONTENT FALLBACK or EMPTY STATE while processing
                        <div className="p-12 flex flex-col items-center justify-center">
                            <h2 className="text-4xl font-bold text-white mb-6 text-center leading-tight">
                                {currentSlide?.title || (isProcessingSlides ? "Preparing Presentation..." : "")}
                            </h2>
                            <div className="slide-body w-full max-w-[600px] overflow-y-auto max-h-[60%]">
                                {currentSlide?.content?.split('\n').map((line: string, i: number) => (
                                    <p key={i} className="text-[#ccc] text-lg text-center mb-4 leading-relaxed font-light">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unified Slide Metadata Overlay */}
                    <div className="absolute top-6 left-8 z-10">
                        <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-[#00ff88]/20">
                            Slide {currentSlideIndex + 1}
                        </span>
                    </div>

                    <div className="absolute bottom-6 right-8 z-10 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono text-white tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            {currentSlideIndex + 1} / {slides.length}
                        </span>
                    </div>
                </div>

                {/* Floating Navigation Controls (Always Available) */}
                {slides.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-[100]">
                            <button
                                onClick={prevSlide}
                                disabled={currentSlideIndex === 0}
                                className="p-3 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm shadow-xl"
                            >
                                <IconChevronLeft />
                            </button>
                        </div>

                        <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[10px] group-hover:translate-x-0 z-[100]">
                            <button
                                onClick={nextSlide}
                                disabled={currentSlideIndex === slides.length - 1}
                                className="p-3 rounded-full bg-white/5 hover:bg-[#00ff88] hover:text-black text-white transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm shadow-xl"
                            >
                                <IconChevronRight />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Progress Bar */}
            {slides.length > 0 && (
                <div className="h-1 bg-[#222] w-full">
                    <div
                        className="h-full bg-[#00ff88] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                        style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default SlideViewer;
