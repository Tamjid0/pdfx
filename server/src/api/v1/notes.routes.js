import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { optionalVerifyToken } from '../../middleware/authMiddleware.js';
import { notesSchema } from '../../validations/notes.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import logger from '../../utils/logger.js';

const router = express.Router();

const getPromptByCategory = (category) => {
    const baseBlocks = `
Possible Block Types:
1. "overview": A comprehensive executive summary that sets the context. Significant detail is expected.
2. "key_concepts": In-depth topic-wise breakdown. Each concept should have a substantial explanation. Include "source_pages" if possible.
3. "definitions": Precise definitions for specialized terms. Use format: {"type": "definitions", "items": [{"term": "Concept", "explanation": "Detailed definition..."}]}.
4. "steps": Detailed, step-by-step sequential processes or workflows.
5. "examples": Rich illustrative cases, evidence, or scenarios mentioned in the text.
6. "formulas": Mathematical formulas rendered in Katex. Use format: {"type": "formulas", "items": [{"formula": "E=mc^2", "label": "Energy-Mass Equivalence"}]}.
7. "code": Programming code blocks with explanations. Use format: {"type": "code", "language": "python", "content": "print('hello')"}.
8. "action_items": Tasks, responsibilities, or follow-ups. Use format: {"type": "action_items", "items": [{"task": "@John to review", "status": "pending"}]}.
9. "milestones": Significant deadlines or phases. Use format: {"type": "milestones", "items": [{"milestone": "Phase 1", "date": "TBD"}]}.
10. "blockers": Obstacles or risks that need resolution.
11. "revision_summary": While concise, this should still cover all main pillars.
`;

    const prompts = {
        study: `You are an elite academic research assistant. Goal: Transform text into highly detailed, research-grade Study Notes.
            Thought Process: 
            1. ANALYZE: Capture every nuance, formula, and conceptual pillar.
            2. DRAFT: Create a "Perfect Learning Note" that explains 'why' and 'how'.
            3. MAP: Structure into: overview, key_concepts, definitions, formulas, examples, revision_summary.`,

        meeting: `You are a high-level corporate secretary. Goal: Record decisions and accountability with Meeting Notes.
            Thought Process:
            1. ANALYZE: Identify attendees, context, key decisions, and action items.
            2. DRAFT: Create a "Perfect Minutes Note" focusing on ownership and results.
            3. MAP: Structure into: overview (as context), key_concepts (as decisions), action_items, revision_summary (as parking lot).`,

        project: `You are a lead project manager. Goal: Manage moving parts with Project Notes.
            Thought Process:
            1. ANALYZE: Identify mission scope, milestones, resources, and current blockers.
            2. DRAFT: Create a "Perfect Execution Note" focusing on the path to 'Done'.
            3. MAP: Structure into: overview (scope), milestones, key_concepts (resources), blockers, revision_summary.`,

        presentation: `You are a world-class storyteller and public speaker. Goal: Structure a compelling Presentation Note.
            Thought Process:
            1. ANALYZE: Extract narrative flow, key punchlines, and supporting evidence.
            2. DRAFT: Create a "Perfect Talk Script" that breaks down slides and talking points.
            3. MAP: Structure into: overview (narrative hook), steps (slides), key_concepts (supporting data), revision_summary (Q&A prep).`
    };

    const selectedPrompt = prompts[category] || prompts.study;

    return `${selectedPrompt}

    CRITICAL OBJECTIVE: Prioritize DEPTH and ACCURACY. The note must be accurate and useful first, then fitted into blocks.

    ${baseBlocks}

    Return ONLY a valid JSON object in this exact structure:
    {
      "document_type": "string",
      "document_length_category": "short|medium|long",
      "blocks": [
        { "type": "block_type", "title": "Section Title", "content": "Detailed markdown string or [strings]", "items": [any objects], "source_pages": [number] }
      ]
    }
    Do NOT include markdown formatting, code fences, or explanations outside the JSON. Return only the raw JSON.`;
};

router.post('/', optionalVerifyToken, aiGenerationLimiter, validate(notesSchema), async (req, res) => {
    try {
        const { fileId, scope, settings } = req.body;
        const { category = 'study' } = settings || {};

        let fullText = '';
        if (fileId && scope) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const promptInstruction = getPromptByCategory(category);

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const jsonResponse = safeParseAiJson(aiResponse, 'Notes');

        if (!jsonResponse || !Array.isArray(jsonResponse.blocks)) {
            throw new ApiError(500, "Failed to generate valid structured notes.");
        }

        res.json(jsonResponse);
    } catch (err) {
        logger.error('Notes generation error:', err);
        res.status(500).json({ message: 'Failed to generate notes' });
    }
});

export default router;
