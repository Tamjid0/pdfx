'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker. Using a CDN for zero-config Next.js compatibility.
// Ensure this version matches the package.json version.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfSlideRendererProps {
    url: string;
    pageNumber: number;
    className?: string;
}

const PdfSlideRenderer: React.FC<PdfSlideRendererProps> = ({ url, pageNumber, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load PDF Document
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        // Fetch the PDF using standard fetch to handle headers if needed, 
        // or let PDF.js handle it
        const loadingTask = pdfjsLib.getDocument(url);

        loadingTask.promise.then(
            (loadedPdf) => {
                if (isMounted) {
                    setPdf(loadedPdf);
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Error loading PDF:", err);
                if (isMounted) {
                    setError("Failed to load PDF document.");
                    setLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
        };
    }, [url]);

    const renderTaskRef = useRef<any>(null);

    // Render Page to Canvas
    useEffect(() => {
        if (!pdf || !canvasRef.current) return;

        let isCurrentRender = true;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const renderPage = async () => {
            if (!context || !isCurrentRender) return;

            try {
                // 1. Cancel any existing render task for this canvas
                if (renderTaskRef.current) {
                    await renderTaskRef.current.cancel();
                    renderTaskRef.current = null;
                }

                // 2. Clear canvas before new render
                context.clearRect(0, 0, canvas.width, canvas.height);

                const page = await pdf.getPage(pageNumber);
                if (!isCurrentRender) return;

                // 3. Setup Viewport (2x scale for sharpness)
                const viewport = page.getViewport({ scale: 2.0 });
                const containerWidth = canvas.parentElement?.clientWidth || 800;
                const containerHeight = canvas.parentElement?.clientHeight || 450;

                const scale = Math.min(
                    containerWidth / viewport.width,
                    containerHeight / viewport.height
                ) * 2.0;

                const finalViewport = page.getViewport({ scale });
                canvas.height = finalViewport.height;
                canvas.width = finalViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: finalViewport,
                };

                // 4. Start Render and track it in Ref
                renderTaskRef.current = page.render(renderContext);

                await renderTaskRef.current.promise;
                renderTaskRef.current = null;
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error("Error rendering page:", err);
                }
            }
        };

        renderPage();

        return () => {
            isCurrentRender = false;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [pdf, pageNumber]);

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (loading) return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
        </div>
    );

    return (
        <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full object-contain ${className}`}
        />
    );
};

export default PdfSlideRenderer;
