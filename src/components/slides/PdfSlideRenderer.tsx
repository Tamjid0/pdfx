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
    scale?: number; // Optional scale override for thumbnails
}

const PdfSlideRenderer: React.FC<PdfSlideRendererProps> = ({ url, pageNumber, className, scale: forcedScale }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load PDF Document
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

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
                // 1. Fetch the page FIRST before touching the canvas to avoid flicker
                const page = await pdf.getPage(pageNumber);
                if (!isCurrentRender) return;

                // 2. Setup Viewport
                const containerWidth = canvas.parentElement?.clientWidth || 800;
                const containerHeight = canvas.parentElement?.clientHeight || 450;

                // Use forcedScale (for thumbnails) or calculate based on container
                const baseScale = forcedScale || 2.0;
                const viewport = page.getViewport({ scale: baseScale });

                const ratio = Math.min(
                    containerWidth / viewport.width,
                    containerHeight / viewport.height
                );

                const finalScale = baseScale * ratio;
                const finalViewport = page.getViewport({ scale: finalScale });

                // 3. Cancel any existing render task
                if (renderTaskRef.current) {
                    await renderTaskRef.current.cancel();
                    renderTaskRef.current = null;
                }

                // 4. Update canvas dimensions and clear just before new render
                canvas.height = finalViewport.height;
                canvas.width = finalViewport.width;
                context.clearRect(0, 0, canvas.width, canvas.height);

                const renderContext = {
                    canvasContext: context,
                    viewport: finalViewport,
                };

                // 5. Start Render and track it
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
    }, [pdf, pageNumber, forcedScale]);

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
