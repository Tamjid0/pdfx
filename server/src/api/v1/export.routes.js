import express from 'express';
import puppeteer from 'puppeteer';
import HTMLtoDOCX from 'html-to-docx';
import validate from '../../middleware/validate.js';
import { exportSchema } from '../../validations/export.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.post('/', validate(exportSchema), async (req, res, next) => {
    const { format, mode, filename = 'exported-document' } = req.body;
    const html = req.body.content || req.body.html;
    const data = req.body.data;

    console.log(`[Export] Request: format=${format}, mode=${mode}, filename=${filename}`);

    if (!html && (format === 'pdf' || format === 'docx')) {
        console.error('[Export] Error: No content/HTML provided for PDF/DOCX export');
        return res.status(400).json({ error: 'No content to export' });
    }

    try {
        if (format === 'pdf') {
            console.log('[Export] Generating PDF...');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            try {
                // Set the content
                await page.setContent(html || '<html><body>No content</body></html>', { waitUntil: 'networkidle0', timeout: 30000 });

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
                console.log('[Export] PDF generated successfully');

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
                res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('[Export] Puppeteer generation failed:', pdfError);
                await browser.close();
                return res.status(500).json({ error: 'PDF Generation Failed' });
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
