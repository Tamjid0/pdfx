import express from 'express';
import { generateFullDocumentTransformation } from '../../../services/aiGenerationService.js';
import { getVectorStore } from '../../../services/vectorStoreService.js';

const router = express.Router();

router.post('/format', async (req, res) => {
    const { html, fileId, prompt } = req.body;
    let fullText = html;

    if (!fullText && !fileId) {
        return res.status(400).json({ error: 'Either HTML content or fileId must be provided.' });
    }

    try {
        if (fileId) {
            const vectorStore = await getVectorStore(fileId);
            if (vectorStore) {
                const allDocs = await vectorStore.similaritySearch("", vectorStore.memoryVectors.length);
                fullText = allDocs.map(doc => doc.pageContent).join('\n\n');
            } else {
                return res.status(404).json({ error: `No document found for fileId: ${fileId}` });
            }
        }

        const promptInstruction = `The following content is the current document in HTML or plain text. 
        Your task is to reformat it into a professional, semantic HTML document based on these instructions: "${prompt}".
        
        Rules:
        - Use semantic HTML tags (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, etc.).
        - DO NOT include <html>, <head>, or <body> tags. Just the internal content.
        - Ensure proper structure and readability.
        - If the user asks for a specific layout (like a table or list), implement it using standard HTML tags.
        - Return ONLY the HTML content.`;

        let formattedHtml = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'html' });

        // Clean up markdown fences if present
        if (formattedHtml.includes('```')) {
            formattedHtml = formattedHtml.replace(/```html\n?|```\n?/g, '').trim();
        }

        res.json({ formattedHtml: formattedHtml });
    } catch (error) {
        console.error('Error formatting HTML:', error);
        res.status(500).json({ error: 'Failed to format content' });
    }
});

export default router;