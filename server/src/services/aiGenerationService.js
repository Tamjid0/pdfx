import genAI from '../config/gemini.js';
import vectorStoreService from './vectorStoreService.js';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});


/**
 * Helper to retry operations with exponential backoff
 */
async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            // Check for specific error types if needed (e.g. Rate Limit)
            logger.warn(`[AI-Service] Attempt ${i + 1} failed. Retrying... Error: ${error.message}`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

/**
 * Performs full-document transformation for raw text (e.g., summaries, notes).
 * @param {string} fullText - The raw text content to process.
 * @param {string} promptInstruction - Specific instructions for the AI.
 * @param {object} [options={}] - Additional options.
 * @returns {Promise<string>} - The AI generated content.
 */
export async function generateFullDocumentTransformation(fullText, promptInstruction, options = {}) {
    if (!fullText) {
        throw new Error('Full text must be provided for transformation.');
    }

    const systemPrompt = `
You are an expert AI assistant.
You MUST ONLY use information from the "Document content" below.
Do NOT invent facts. If the answer is not in the document, say so.
Maintain a ${options.outputFormat || 'text'} format for your output.

Document content:
"""
${fullText}
"""

User's specific instruction: "${promptInstruction}"
`;

    try {
        const result = await retryOperation(() => aiModel.generateContent(systemPrompt));
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        logger.error(`[AI-Service] FullDoc transformation failed: ${error.message}`);
        throw new Error('Failed to generate full document transformation.');
    }
}

export async function generateChunkBasedTransformation(fileId, query, topN = 10) {
    const searchResults = await vectorStoreService.similaritySearch(fileId, query, topN);

    if (searchResults.length === 0) {
        return "Information not found in document.";
    }

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const systemPrompt = `
You are a conversational AI assistant similar to ChatGPT, Claude, and Gemini here your name is pdfx.


You should answer in well structured markdown.
Your response should be well structured like in the gemini app.
structuring should be based on the question.
Use table, bullet points, emojis, code blocks etc only when needed 
(think like when it needs you must do it and when dont need dont need to do it)
avoid nested table and list if not needed .

the the format must be bug free and not broken. it will be rendered on a next js app. 




STYLE:
- Natural, human-like explanation
- Clean flow, no over-formatting
- Explain things the way you would in a normal chat
- explain in multiple structured section
- Use numarical emojis, or emojis like tick when nedded note necesirily always

- Rules:
-Don't greet the user
-Don't say anything else other than the answer
-Dont ever expose your real identity(Gemini)
- Don't share your any personal information.
- Only say you'r an ai assistant who can help with the given context 
- Never ever answer to general questions.
- Never ever answer to questions that are not related to the context.

REFERENTIAL CITATIONS:
- Each text block in the context is prepended with [[UUID]] where UUID is a unique identifier.
- When you reference a specific fact, you MUST cite it using the EXACT UUID from the context.
- Format: [keyword](#UUID) - Copy the EXACT UUID from between [[ and ]].
- Example: If context shows "[[a1b2-c3d4-5678]]: Revenue increased"
  Then cite as: "The [revenue increased](#a1b2-c3d4-5678)"
- CRITICAL: DO NOT OUTPUT THE RAW "[[UUID]]" FORMAT. ALWAYS USE THE MARKDOWN LINK FORMAT.
- CRITICAL: Use the EXACT UUID - do NOT make up IDs like "node_1".
- DO NOT use footnotes or citation bubbles.
- DO NOT mention "UUID" in the visible text.


Context:
"""
${context}
"""

User Query: "${query}"
`;

    try {
        const result = await retryOperation(() => aiModel.generateContent(systemPrompt));
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        logger.error(`[AI-Service] Chunk transformation failed: ${error.message}`);
        throw new Error('Failed to generate response.');
    }
}

export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 10, inputSelectionContext = []) {
    // DEBUG: Trace raw input
    console.log(`[AI-Service] Raw Input Context:`, typeof inputSelectionContext, Array.isArray(inputSelectionContext), JSON.stringify(inputSelectionContext).substring(0, 200));

    // 1. Validate Selection Context
    let selectionContext = Array.isArray(inputSelectionContext) ? inputSelectionContext : (inputSelectionContext ? [inputSelectionContext] : []);

    console.log(`[AI-Service] Normalised Selection Context: ${selectionContext.length} items`);

    // Vector Search with Smart Intersection Strategy
    let searchResults = [];
    try {
        if (selectionContext.length > 0) {
            // Dual search: Query + Selected text
            const queryResults = await vectorStoreService.similaritySearch(fileId, query, topN);
            const selectionQuery = selectionContext.join(' ');
            const selectionResults = await vectorStoreService.similaritySearch(fileId, selectionQuery, topN);

            // Find intersection: chunks that appear in BOTH searches
            const queryIds = new Set(queryResults.map(doc => doc.metadata?.chunkId || doc.pageContent));
            searchResults = selectionResults.filter(doc => {
                const id = doc.metadata?.chunkId || doc.pageContent;
                return queryIds.has(id);
            });

            // Fallback: If no intersection, use selection results (more relevant than query alone)
            if (searchResults.length === 0) {
                searchResults = selectionResults.slice(0, 5); // Limit to 5 to save cost
            }
        } else {
            // No selection: Standard vector search
            searchResults = await vectorStoreService.similaritySearch(fileId, query, topN);
        }
    } catch (err) {
        // Non-fatal: Proceed with selection context if available
    }

    // Early Exit if NO Context at all
    if (searchResults.length === 0 && selectionChunks.length === 0) {
        yield "Information not found in document.";
        return;
    }

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    let visualSelectionPrompt = "";
    if (selectionContext && selectionContext.length > 0) {
        // Sanitize selection context to handle potential object/string mismatches
        const sanitizedContext = selectionContext.map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) {
                // Handle case where frontend sends { text: "..." } or similar
                return item.text || item.content || JSON.stringify(item);
            }
            return String(item);
        });

        visualSelectionPrompt = `
### 🎯 USER HAS SELECTED CONTENT
The user has MANUALLY SELECTED the following text on the document page.

"""
${sanitizedContext.join('\n')}
"""

✅ **INSTRUCTION:**
- **IF** the user's question refers to "this", "here", "selected text", or asks about specific details found in the selection -> **Focus strictly on the selection above.**
- **IF** the user asks a GENERAL question (e.g., "Summarize the document", "What is the main topic") -> Answer based on the full document context below, but you may mention how the selected part fits in.
- **DEFAULT:** Assume the user is interested in the selected text unless clearly stated otherwise.
`;
    }

    const systemPrompt = `
You are a conversational AI assistant named pdfx.

You should answer in well structured markdown.
Your response should be well structured like in the gemini app.
structuring should be based on the question.
Use table, bullet points, emojis, code blocks etc only when needed.

STYLE:
- Natural, human-like explanation
- Clean flow, no over-formatting
- Explain things the way you would in a normal chat
- Use numerical emojis, or emojis like tick when needed

Rules:
- Don't greet the user
- Don't say anything else other than the answer
- Don't ever expose your real identity (Gemini)
- Don't share your any personal information
- **CRITICAL:** Answer ONLY based on the provided **Selected Content** (above) and **Document Context** (below).
- If the user asks about the "selected area", USE THE "USER HAS SELECTED CONTENT" SECTION.
- Never answer general questions unrelated to the context.

REFERENTIAL CITATIONS:
- Each text block in the context is prepended with [[UUID]].
- When referring to the Document Context, cite using [keyword](#UUID).
- Do NOT cite the Selected Content section.

Document Context:
"""
${context || "No additional document matches found."}
"""

${visualSelectionPrompt}

User Query: "${query}"
`;


    try {
        const result = await retryOperation(() => aiModel.generateContentStream(systemPrompt));

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        logger.error(`[AI-Service] Streaming transformation failed: ${error.message}`);
        throw new Error('Failed to generate streaming response.');
    }
}

/**
 * Generate AI response for quiz/flashcard item-specific questions
 * @param {string} fileId - Document ID
 * @param {string} itemType - 'quiz' or 'flashcard'
 * @param {object} itemData - The quiz question or flashcard data
 * @param {string} message - User's question
 * @param {array} chatHistory - Previous messages in this conversation
 * @returns {Promise<object>} - Response with text, nodeIds, and pageIndex
 */
export async function generateItemContextResponse(fileId, itemType, itemData, message, chatHistory = []) {
    // Build search query from item data and user message
    const searchQuery = itemType === 'quiz'
        ? `${itemData.question} ${itemData.correctAnswer} ${message}`
        : `${itemData.question} ${itemData.answer} ${message}`;

    const searchResults = await vectorStoreService.similaritySearch(fileId, searchQuery, 5);

    if (searchResults.length === 0) {
        return {
            text: "I couldn't find relevant information in the document to answer this question.",
            nodeIds: [],
            pageIndex: null
        };
    }

    // Extract node IDs and build context
    const nodeIds = [];
    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';

        // Extract node IDs from metadata if available
        if (meta.nodeIds && Array.isArray(meta.nodeIds)) {
            nodeIds.push(...meta.nodeIds);
        }

        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    // Build chat history context
    const historyContext = chatHistory.length > 0
        ? chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
        : '';

    const itemContext = itemType === 'quiz'
        ? `Question: ${itemData.question}\nOptions: ${itemData.options?.map(o => o.value).join(', ') || 'N/A'}\nCorrect Answer: ${itemData.correctAnswer}`
        : `Flashcard Front: ${itemData.question}\nFlashcard Back: ${itemData.answer}`;

    const systemPrompt = `
You are an AI tutor helping a student understand a ${itemType} item from their study material.

${itemType.toUpperCase()} CONTEXT:
${itemContext}

DOCUMENT CONTEXT:
"""
${context}
"""

${historyContext ? `PREVIOUS CONVERSATION:\n${historyContext}\n` : ''}

STUDENT'S QUESTION: "${message}"

INSTRUCTIONS:
- Provide a clear, educational explanation
- Reference the document context when relevant
- Help the student understand the concept, don't just give the answer
- Be concise but thorough
- Use markdown formatting for clarity
`;

    try {
        const result = await retryOperation(() => aiModel.generateContent(systemPrompt));
        const text = result?.response?.text()?.trim() || "No content generated.";

        // Get the first page index from search results
        const pageIndex = searchResults[0]?.metadata?.pageIndex;

        return {
            text,
            nodeIds: [...new Set(nodeIds)], // Remove duplicates
            pageIndex
        };
    } catch (error) {
        logger.error(`[AI-Service] Item context response failed: ${error.message}`);
        throw new Error('Failed to generate response for item context.');
    }
}

