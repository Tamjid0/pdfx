import express from 'express';
import { generateFullDocumentTransformation } from '../../../services/aiGenerationService.js';

const router = express.Router();

router.post('/format', async (req, res) => {
    const { html, fileId, prompt } = req.body;
    let fullText = html;

    if (!fullText && !fileId) {
        return res.status(400).json({ error: 'Either HTML content or fileId must be provided.' });
    }

    try {
        if (fileId) {
            const vectorStore = getVectorStore(fileId);
            if (vectorStore) {
                const allDocs = await vectorStore.similaritySearch("", vectorStore.memoryVectors.length);
                fullText = allDocs.map(doc => doc.pageContent).join('\n\n');
            } else {
                return res.status(404).json({ error: `No document found for fileId: ${fileId}` });
            }
        }

        const promptInstruction = `Format the following HTML based on the user's prompt: ${prompt}`;

        let formattedHtml = await generateFullDocumentTransformation(fullText, promptInstruction);

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