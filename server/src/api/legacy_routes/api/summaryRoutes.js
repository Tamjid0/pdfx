import express from 'express';
import { generateFullDocumentTransformation } from '../../../services/aiGenerationService.js';
import { getVectorStore } from '../../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/summary', aiGenerationLimiter, async (req, res, next) => {
    const { text, fileId, settings } = req.body;
    let fullText = text;

    if (!fullText && !fileId) {
        return res.status(400).json({ error: 'Either text or fileId must be provided.' });
    }

    try {
        // If a fileId is provided, retrieve the full text from the vector store
        if (fileId) {
            const vectorStore = await getVectorStore(fileId);
            if (vectorStore) {
                // Workaround to get all documents from a MemoryVectorStore
                const allDocs = await vectorStore.similaritySearch("", 100);
                fullText = allDocs.map(doc => doc.pageContent).join('\n\n');
            } else {
                return res.status(404).json({ error: `No document found for fileId: ${fileId}` });
            }
        }

        const {
            summaryLength = 50,
            summaryFormat = 'paragraph',
            keywords = '',
            tone = 'professional',
            language = 'English',
            summaryType = 'abstractive',
            targetWordCount
        } = settings || {};

        let promptInstruction = `Generate a summary and key points for the following text, adhering to these rules:\n`;
        promptInstruction += `- Summary type: ${summaryType}\n`;
        if (targetWordCount && targetWordCount > 0) {
            promptInstruction += `- It is a strict rule that the summary must be approximately ${targetWordCount} words long.\n`;
        } else {
            promptInstruction += `- The summary should be approximately ${summaryLength}% of the original text length.\n`;
        }
        if (summaryFormat === 'bullets') {
            promptInstruction += `- The main summary should be presented as a list of bullet points.\n`;
        } else {
            promptInstruction += `- The main summary should be a cohesive paragraph.\n`;
        }
        promptInstruction += `- The tone of the summary must be ${tone}.\n`;
        promptInstruction += `- The summary must be in ${language}.\n`;
        if (keywords) {
            promptInstruction += `- Pay special attention to the following keywords: ${keywords}.\n`;
        }
        promptInstruction += `\nReturn ONLY a valid JSON object in this exact structure:\n{\n  "summary": "string",\n  "keyPoints": ["string", "string", ...]\n}\nDo NOT include markdown formatting, code fences, explanations, or extra text.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        let json;
        try {
            json = JSON.parse(aiResponse);
        } catch (e) {
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (match) json = JSON.parse(match[0]);
        }

        if (!json || !json.summary) {
            throw new Error("Invalid JSON structure from AI.");
        }

        res.json(json);

    } catch (error) {
        next(error);
    }
});

export default router;
