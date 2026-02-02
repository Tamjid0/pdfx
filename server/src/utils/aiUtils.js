import logger from './logger.js';

/**
 * Safely parses JSON from an AI response string.
 * Handles markdown code blocks, leading/trailing text, and empty responses.
 * 
 * @param {string} text - The raw AI response text.
 * @param {string} moduleName - Name of the module (for logging).
 * @returns {object|null} - The parsed JSON object or null if parsing fails.
 */
export function safeParseAiJson(text, moduleName = 'AI') {
    if (!text || typeof text !== 'string') {
        logger.error(`[aiUtils] ${moduleName}: Received empty or non-string response.`);
        return null;
    }

    let cleanText = text.trim();

    // 1. Try direct parsing first
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        // Continue to extraction logic
    }

    // 2. Handle Markdown Code Fences (common in LLM output)
    // Matches ```json { ... } ``` or ``` { ... } ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleanText.match(codeBlockRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            // If the content inside the block is still not pure JSON, try falling through
        }
    }

    // 3. Last Resort: Brute-force extraction of the first '{' to last '}'
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        let jsonCandidate = cleanText.substring(firstBrace, lastBrace + 1);

        // Final Hardening: Remove trailing commas in arrays/objects which break JSON.parse
        // This is a common LLM mistake
        jsonCandidate = jsonCandidate.replace(/,(\s*[\]}])/g, '$1');

        try {
            return JSON.parse(jsonCandidate);
        } catch (e) {
            logger.error(`[aiUtils] ${moduleName}: JSON extraction failed. Error: ${e.message}`);
            logger.debug(`[aiUtils] Problematic segment: ${jsonCandidate.substring(0, 100)}...`);
        }
    }

    logger.error(`[aiUtils] ${moduleName}: No valid JSON found in response.`);
    return null;
}
