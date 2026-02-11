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
import { addAIJob, isRedisConnected } from '../../services/queueService.js';

const router = express.Router();

const getPromptByCategory = (category) => {
    const baseBlocks = `
    Strictly Structure the output into these specific block types. Do NOT invent new types.
    
    1. "summary": Quick executive summary.
       Schema: { "type": "summary", "title": "Quick Summary", "content": "markdown string" }
    
    2. "text": Context, history, or general information.
       Schema: { "type": "text", "title": "Historical Context", "content": "markdown string" }
    
    3. "keywords": List of important terms.
       Schema: { "type": "keywords", "title": "Key Terms", "items": ["Term1", "Term2"] }
    
    4. "definitions": Table of precise definitions.
       Schema: { "type": "definitions", "title": "Key Definitions", "items": [{ "term": "Atom", "definition": "Basic unit of matter" }] }
    
    5. "explanation": Collapsible deep-dive into a complex topic.
       Schema: { "type": "explanation", "title": "Detailed Explanation", "content": "markdown string with headers" }
    
    6. "formulas": Mathematical formulas.
       Schema: { "type": "formulas", "title": "Important Formulas", "items": [{ "formula": "E=mc^2", "label": "Energy", "explanation": "Mass-energy equivalence" }] }
    
    7. "examples": Problem-solution pairs.
       Schema: { "type": "examples", "title": "Example Problems", "items": [{ "problem": "Calculate X", "solution": "Steps...", "answer": "42", "note": "Tip" }] }
    
    8. "quiz": Practice questions.
       Schema: { "type": "quiz", "title": "Self Check", "items": [{ "question": "What is...?", "answer": "It is...", "hint": "Think about..." }] }
    `;

    const prompts = {
        study: `You are an elite academic tutor. Goal: Create highly structured, interactive Study Notes.
            Strategy:
            1. Start with a "summary".
            2. Provide "text" for background/context.
            3. List "keywords".
            4. Define "definitions" for technical terms.
            5. Use "explanation" blocks for the core heavy concepts (collapsible).
            6. If applicable, add "formulas" and "examples".
            7. End with a "quiz" to test understanding.`,

        meeting: `You are a corporate secretary. Goal: Create structured Meeting Minutes.
            Strategy:
            1. "summary" of the meeting goal.
            2. "keywords" for attendees/tags.
            3. "text" blocks for discussion points.
            4. "examples" block used for Action Items (Problem=Task, Solution=Owner).`,

        project: `You are a project manager. Goal: Create a Project Status Report.
            Strategy:
            1. "summary" of status.
            2. "definitions" for project acronyms.
            3. "text" for updates.
            4. "explanation" for blockers/risks.`,

        presentation: `You are a world-class public speaking coach. Goal: Create a structured Presentation Deck.
            Strategy:
            1. Create a "presentation_deck" block.
            2. Break content into 5-7 logical "slides".
            3. For each slide, write the SCRIPT (what to say), DELIVERY cues (what to do), and DEEP DIVE (safety net info).
            
            Return this EXACT JSON structure for presentation mode:
            {
               "blocks": [
                  {
                    "type": "presentation_deck",
                    "title": "Presentation Title",
                    "subtitle": "Subtitle",
                    "slides": [
                      {
                        "title": "Slide 1: Intro",
                        "script": "Markdown script...",
                        "delivery": ["Look at camera", "Pause for effect"],
                        "deep_dive": [{ "question": "Why?", "answer": "Because..." }],
                        "timing": "30 sec"
                      }
                    ]
                  }
               ]
            }`
    };

    const selectedPrompt = prompts[category] || prompts.study;

    // Use specific base blocks for non-presentation modes, or just generic instruction for presentation
    const instructions = category === 'presentation'
        ? "Return ONLY the valid JSON for the presentation_deck as shown above. Do not use other block types."
        : `${baseBlocks}
           Return ONLY a valid JSON object in this exact structure:
           {
             "blocks": [
               { "type": "block_type", "title": "Optional Title", ...block_specific_fields }
             ]
           }`;

    return `${selectedPrompt}

    ${instructions}

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

        // --- BACKGROUND PROCESSING LOGIC ---
        // Threshold: ~10k chars or explicit request
        const useBackground = req.body.background || fullText.length > 10000;
        const redisAvailable = await isRedisConnected();

        if (useBackground && redisAvailable) {
            logger.info(`[NotesRoute] Backgrounding generation for ${fileId || 'raw text'} (Length: ${fullText.length})`);
            const job = await addAIJob('notes', {
                fullText,
                promptInstruction,
                options: { outputFormat: 'json' }
            });
            return res.json({ success: true, jobId: job.id, isBackground: true });
        }
        // ------------------------------------

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
