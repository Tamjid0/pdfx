import express from 'express';
import puppeteer from 'puppeteer';
import HTMLtoDOCX from 'html-to-docx';
import validate from '../../middleware/validate.js';
import { exportSchema } from '../../validations/export.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

// Helper to decode basic HTML entities
function decodeEntities(str) {
    if (!str) return str;
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'") // &apos;
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');
}

router.post('/', validate(exportSchema), async (req, res, next) => {
    const { format, mode, filename = 'exported-document' } = req.body;
    let html = req.body.content || req.body.html;
    const data = req.body.data;

    // Decode HTML if it appears to be entity-encoded at the start
    if (html && (html.trim().startsWith('&lt;') || html.includes('&lt;html'))) {
        console.log('[Export] Detected entity-encoded HTML, decoding...');
        html = decodeEntities(html);
    }

    console.log(`[Export] ========== NEW EXPORT REQUEST ==========`);
    console.log(`[Export] Format: ${format}, Mode: ${mode}, Filename: ${filename}`);
    console.log(`[Export] HTML length: ${html?.length || 0} characters`);
    console.log(`[Export] HTML preview:`, html?.substring(0, 200));

    if (!html && (format === 'pdf' || format === 'docx')) {
        console.error('[Export] Error: No content/HTML provided for PDF/DOCX export');
        return res.status(400).json({ error: 'No content to export' });
    }

    try {
        if (format === 'pdf') {
            console.log('[Export] Starting PDF generation with Puppeteer...');
            let browser;

            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                console.log('[Export] Browser launched successfully');

                const page = await browser.newPage();
                console.log('[Export] New page created');

                // Set the content
                await page.setContent(html || '<html><body>No content</body></html>', { waitUntil: 'networkidle0', timeout: 30000 });
                console.log('[Export] Content set successfully');

                // Generate PDF
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '20mm',
                        right: '20mm',
                        bottom: '20mm',
                        left: '20mm'
                    }
                });

                await browser.close();
                console.log('[Export] PDF generated successfully, size:', pdfBuffer.length, 'bytes');

                if (!pdfBuffer || pdfBuffer.length === 0) {
                    throw new Error('Generated PDF buffer is empty');
                }

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
                console.log('[Export] Sending PDF response...');
                res.send(Buffer.from(pdfBuffer));
                console.log('[Export] PDF sent successfully');
            } catch (pdfError) {
                console.error('[Export] !!!!! PUPPETEER ERROR !!!!!');
                console.error('[Export] Error details:', pdfError.message);
                console.error('[Export] Error stack:', pdfError.stack);
                if (browser) {
                    await browser.close();
                    console.log('[Export] Browser closed after error');
                }
                return res.status(500).json({ error: 'PDF Generation Failed', details: pdfError.message });
            }

        } else if (format === 'docx') {
            console.log('[Export] Generating DOCX...');

            // html-to-docx sometimes fails on full HTML docs with styles in certain versions
            // Try extracting only the body content if it's a full document
            let docxHtml = html;
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
                docxHtml = bodyMatch[1];
            }

            const docxBuffer = await HTMLtoDOCX(docxHtml, null, {
                table: { row: { cantSplit: true } },
                footer: true,
                pageNumber: true,
            });

            console.log('[Export] DOCX generated successfully');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.docx`);
            res.send(docxBuffer);

        } else if (format === 'csv') {
            console.log('[Export] Generating CSV...');
            // Basic JSON to CSV logic for quiz or data
            let exportData = data;

            // Extract array for known modes
            if (mode === 'quiz' && data && data.quiz) exportData = data.quiz;
            else if (mode === 'flashcards' && data && data.flashcards) exportData = data.flashcards;

            if (!Array.isArray(exportData)) {
                console.error('[Export] CSV Error: data is not an array', typeof exportData);
                return res.status(400).json({ error: 'CSV export requires an array of data' });
            }

            if (exportData.length === 0) {
                return res.status(400).json({ error: 'No data to export' });
            }

            const headers = Object.keys(exportData[0]);
            const csvRows = [
                headers.join(','), // Header row
                ...exportData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ];
            const csvBuffer = Buffer.from(csvRows.join('\n'));

            console.log('[Export] CSV generated successfully');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            res.send(csvBuffer);

        } else {
            throw new ApiError(400, 'Unsupported format');
        }
    } catch (error) {
        next(error);
    }
});

export default router;
