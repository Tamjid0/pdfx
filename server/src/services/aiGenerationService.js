import genAI from '../config/gemini.js';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import path from 'path';
import fs from 'fs';

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
            console.warn(`[AI-Service] Attempt ${i + 1} failed. Retrying in ${delayMs * Math.pow(2, i)}ms... Error: ${error.message}`);
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
        console.error('Error in full document transformation:', error);
        throw new Error('Failed to generate full document transformation.');
    }
}

/**
 * Performs chunk-based RAG generation using a FAISS vector index.
 */
export async function generateChunkBasedTransformation(fileId, query, topN = 10) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    console.log(`[AI-Service] Index loaded from disk for fileId: ${fileId}. Encoding user query...`);
    const searchResults = await vectorStore.similaritySearch(query, topN);

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
        console.error('Error in transformation:', error);
        throw new Error('Failed to generate response.');
    }
}

/**
 * Performs periodic RAG streaming generation using a FAISS vector index.
 */
export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 10) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    console.log(`[AI-Streaming-Service] Index loaded from disk for fileId: ${fileId}. Encoding user query...`);
    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        yield "Information not found in document.";
        return;
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

if the code is mor than one keyword put it on a fenced code block




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
        const result = await retryOperation(() => aiModel.generateContentStream(systemPrompt));

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        console.error('Error in streaming transformation:', error);
        throw new Error('Failed to generate streaming response.');
    }
}
