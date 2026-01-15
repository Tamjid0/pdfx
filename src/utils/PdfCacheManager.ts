import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is set up
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

class PdfCacheManager {
    private static instance: PdfCacheManager;
    private docCache: Map<string, any> = new Map();
    private pageCache: Map<string, ImageBitmap> = new Map();
    private renderStatus: Map<string, 'pending' | 'completed' | 'failed'> = new Map();

    private constructor() { }

    public static getInstance(): PdfCacheManager {
        if (!PdfCacheManager.instance) {
            PdfCacheManager.instance = new PdfCacheManager();
        }
        return PdfCacheManager.instance;
    }

    /**
     * Get or Load PDF Document
     */
    public async getDocument(url: string): Promise<any> {
        if (this.docCache.has(url)) return this.docCache.get(url);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        this.docCache.set(url, pdf);
        return pdf;
    }

    /**
     * Get unique key for cache
     */
    private getCacheKey(url: string, pageNumber: number, scale: number): string {
        return `${url}-${pageNumber}-${scale}`;
    }

    /**
     * Check if page is cached
     */
    public getCachedPage(url: string, pageNumber: number, scale: number): ImageBitmap | null {
        return this.pageCache.get(this.getCacheKey(url, pageNumber, scale)) || null;
    }

    /**
     * Render page to cache
     */
    public async renderToCache(url: string, pageNumber: number, scale: number): Promise<void> {
        const key = this.getCacheKey(url, pageNumber, scale);
        if (this.renderStatus.get(key) === 'completed') return;
        if (this.renderStatus.get(key) === 'pending') return;

        this.renderStatus.set(key, 'pending');

        try {
            const pdf = await this.getDocument(url);
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Create ImageBitmap for fast transfer/drawing
            const bitmap = await createImageBitmap(canvas);
            this.pageCache.set(key, bitmap);
            this.renderStatus.set(key, 'completed');

            console.log(`[PdfCacheManager] Cached page ${pageNumber} at scale ${scale}`);
        } catch (err) {
            console.error(`[PdfCacheManager] Failed to cache page ${pageNumber}`, err);
            this.renderStatus.set(key, 'failed');
        }
    }

    /**
     * Sequential background renderer
     */
    public async startBackgroundRendering(url: string, startPage: number, totalPages: number, scale: number) {
        // First, ensure the current page is cached (highest priority)
        await this.renderToCache(url, startPage, scale);

        // Then render others one by one
        for (let i = 1; i <= totalPages; i++) {
            if (i === startPage) continue;
            await this.renderToCache(url, i, scale);
        }
    }

    /**
     * Clear specific document cache
     */
    public clearDoc(url: string) {
        this.docCache.delete(url);
        // Clean pages too
        for (const key of this.pageCache.keys()) {
            if (key.startsWith(url)) {
                this.pageCache.get(key)?.close();
                this.pageCache.delete(key);
                this.renderStatus.delete(key);
            }
        }
    }
}

export default PdfCacheManager.getInstance();
