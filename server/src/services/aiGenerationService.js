import genAI from '../config/gemini.js';
import vectorStoreService from './vectorStoreService.js';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

const visionModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/**
 * Converts local file information to a GoogleGenerativeAI.Part object.
 */
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}


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
 * Formats chat history into a compact string for the prompt.
 * Keeps only the last 6 messages for token efficiency.
 */
function formatChatHistory(history = []) {
    if (!history || history.length === 0) return "";

    // Last 6 messages (3 user/AI turns)
    const recentHistory = history.slice(-6);

    return recentHistory.map(msg => {
        const role = msg.role === 'user' ? 'U' : 'A';
        return `[${role}: ${msg.content}]`;
    }).join('\n');
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

export async function generateChunkBasedTransformation(fileId, query, topN = 10, chatHistory = []) {
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

- REFERENTVISUAL GROUNDING (CRITICAL):
- You MUST cite your sources using numerical indices with UUID links.
- FORMAT: Wrap the specific phrase or sentence that is supported by a source in a markdown link pointing to that source's UUID.
- EXAMPLE: "The [protons and neutrons reside in the nucleus](#UUID)."
- Do NOT use generic "SOURCE" or [1] buttons. Integrate citations directly into the text flow.
- If multiple sources support a claim, separate them in the link: [text](#UUID1,UUID2).
- Copy the UUID EXACTLY. Do NOT use "node_x" or any other format.
- Ensure the citation is a valid Markdown link pointing to the UUID.
- Do NOT mention "UUID" in visible text.

Context:
"""
${context}
"""

${chatHistory && chatHistory.length > 0 ? `H:\n${formatChatHistory(chatHistory)}\n` : ""}

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

/**
 * Analyzes a single image and returns a description.
 */
export async function analyzeImage(imagePath, prompt = "Describe this image in detail, focus on charts, tables, or key data points.") {
    try {
        const imagePart = fileToGenerativePart(imagePath, "image/png");
        const result = await retryOperation(() => visionModel.generateContent([prompt, imagePart]));
        return result?.response?.text()?.trim() || "No description generated.";
    } catch (error) {
        logger.error(`[AI-Service] Image analysis failed: ${error.message}`);
        return "Failed to analyze image.";
    }
}

export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 10, inputSelectionNodeIds = [], chatHistory = []) {
    // Validate Selection Node IDs
    let selectionNodeIds = Array.isArray(inputSelectionNodeIds) ? inputSelectionNodeIds : (inputSelectionNodeIds ? [inputSelectionNodeIds] : []);

    // Vector Search with Smart Intersection Strategy
    let searchResults = [];
    let selectionChunks = [];

    try {
        if (selectionNodeIds.length > 0) {
            // Retrieve selection chunks directly by node IDs
            selectionChunks = await vectorStoreService.getChunksByNodeIds(fileId, selectionNodeIds);

            // Perform query-based vector search
            const queryResults = await vectorStoreService.similaritySearch(fileId, query, topN);

            // Find intersection
            const selectionIds = new Set(selectionChunks.map(doc => doc.metadata?.nodeId || doc.pageContent));
            searchResults = queryResults.filter(doc => {
                const id = doc.metadata?.nodeId || doc.pageContent;
                return selectionIds.has(id);
            });

            if (searchResults.length === 0) {
                searchResults = selectionChunks.length > 0 ? selectionChunks : queryResults;
            }
        } else {
            searchResults = await vectorStoreService.similaritySearch(fileId, query, topN);
        }
    } catch (err) {
        logger.warn(`[AI-Service] Vector search or retrieval failed: ${err.message}`);
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
    if (selectionChunks && selectionChunks.length > 0) {
        const selectionText = selectionChunks.map(chunk => chunk.pageContent).join('\n');
        visualSelectionPrompt = `
### 🎯 USER HAS SELECTED CONTENT
The user has MANUALLY SELECTED the following content:
"""
${selectionText}
"""
`;
    }

    const systemPrompt = `
You are a conversational AI assistant named pdfx.
You should answer in well structured markdown.
Your response should be well structured like in the gemini app.
Answer ONLY based on the provided Selected Content and Document Context.

Note: Images are analyzed during upload, and their descriptions are included in the context as "[Image Description: ...]".
Use these descriptions to answer questions about diagrams, charts, or images.

STYLE:
- Natural, human-like explanation
- Use clear, professional language.
- Use numerical emojis or ticks where needed.
- VISUAL DATA (CRITICAL):
  - Use markdown tables for structured data or comparisons.
  - If explaining architectures, flows, or relationships, use a Mermaid diagram.
  - Mermaid Format: \`\`\`mermaid [diagram code] \`\`\`. Keep diagrams simple and focused.
  - **MERMAID v11 RULES**: Avoid using 'graph TD' with rounded edges brackets \`(...)\` inside labels as it can cause syntax errors. Use standard \`[label]\` instead.
- DOCUMENT CONTROL:
  - If the user asks you to perform an action on the document (e.g., "Highlight X", "Scroll to Y", "Find Z"), you MUST return a structured command.
  - Command Format: \`\`\`command { "action": "highlight" | "scroll" | "search", "params": { ... } } \`\`\`.
  - Actions:
    - "highlight": { "query": "text to highlight" }
    - "scroll": { "pageIndex": number }
    - "search": { "query": "text to search" }
  - You can still provide a text response alongside the command.
- TEXTUAL GROUNDING (CRITICAL):
  - Every time you state a fact from the document, wrap the RELEVANT WORDS in a markdown link to the source's UUID.
  - FORMAT: [cited text segment](#UUID)
  - **NEGATIVE CONSTRAINT**: Never use the word "SOURCE", "[SOURCE]", or numerical placeholders like "[1]" as link text. Always wrap the actual informative text from your response.
  - DO NOT create separate "SOURCE" links. Ground the text itself.

Rules:
- Don't greet the user.
- Don't say anything else other than the answer.
- Don't ever expose your real identity (pdfx is your name).
- If the user asks about the "selected area", use the provided manual selection.
- CITATIONS: You MUST cite every specific fact using [keyword](#UUID) format from the Document Context.
Document Context:
"""
${context || "No additional document matches found."}
"""

${visualSelectionPrompt}

${chatHistory && chatHistory.length > 0 ? `H:\n${formatChatHistory(chatHistory)}\n` : ""}

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
        yield "I encountered an error while processing your request.";
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

