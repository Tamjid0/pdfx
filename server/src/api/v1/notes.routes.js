import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { notesSchema } from '../../validations/notes.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(notesSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const { keyConcepts = true, actionItems = false, aiSummary = false } = settings || {};

        let promptInstruction = `Design a document-adaptive study note system. Analyze the provided text and decide which of the following blocks are most relevant to include based on document length, structure, and content richness. Do NOT force all blocks; only include those that add value.

Possible Block Types:
1. "overview": A high-level summary of the document's purpose (usually include for long docs).
2. "key_concepts": Topic-wise breakdown with headings and explanations. Include "source_pages" if possible.
3. "definitions": A list of key terms and their meanings (only if explicit definitions exist).
4. "steps": Sequential processes or workflows (only if procedural content exists).
5. "examples": Illustrative cases or evidence (only if present).
6. "formulas": Mathematical formulas rendered in Katex. Use format: {"type": "formulas", "items": [{"formula": "E=mc^2", "label": "Energy-Mass Equivalence"}]}. (Only if formulas exist).
7. "code": Programming code blocks. Use format: {"type": "code", "language": "python", "content": "print('hello')"}. (Only if code exists).
8. "revision_summary": A very concise bulleted list for quick last-minute review.

Return ONLY a valid JSON object in this exact structure:
{
  "document_type": "string",
  "document_length_category": "short|medium|long",
  "blocks": [
    { "type": "block_type", "title": "Optional Title", "content": "string or [string]", "items": [any objects], "source_pages": [number] }
  ]
}
Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const jsonResponse = safeParseAiJson(aiResponse, 'Notes');

        if (!jsonResponse || !Array.isArray(jsonResponse.blocks)) {
            throw new Error("Invalid adaptive JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
