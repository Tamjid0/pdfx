import genAI from '../config/gemini.js';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import path from 'path';
import fs from 'fs';

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

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
        const result = await aiModel.generateContent(systemPrompt);
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
You are an advanced Research Assistant. Provide clear, well-structured responses optimized for a chat interface.

FORMATTING GUIDELINES:
- Use ## for main sections, ### for subsections (sparingly)
- Use **bold** for key terms, *italic* for subtle emphasis
- Keep lists FLAT - avoid deeply nested sub-points (max 1 level of nesting)
- Use simple bullet lists (- item) for clarity
- For tables, keep them SIMPLE with 2-4 columns maximum:
  | Column 1 | Column 2 |
  |----------|----------|
  | Data 1   | Data 2   |
- Use code blocks with \`\`\`language only when showing actual code
- Write concisely - prioritize clarity over exhaustive detail

CRITICAL RULES:
- NEVER use HTML tags (<table>, <tr>, <td>, <div>, <text>, <list>, etc.)
- NEVER mention page numbers or use citation tags
- NEVER create deeply nested hierarchies (a.1.i.A style)
- Keep responses scannable and digestible
- If the answer isn't in the context, state it clearly
- Provide analytical responses based strictly on the context

Context:
"""
${context}
"""

User Query: "${query}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
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
You are an advanced Research Assistant. Provide clear, well-structured responses optimized for a chat interface.

FORMATTING GUIDELINES:
- Use ## for main sections, ### for subsections (sparingly)
- Use **bold** for key terms, *italic* for subtle emphasis
- Keep lists FLAT - avoid deeply nested sub-points (max 1 level of nesting)
- Use simple bullet lists (- item) for clarity
- For tables, keep them SIMPLE with 2-4 columns maximum:
  | Column 1 | Column 2 |
  |----------|----------|
  | Data 1   | Data 2   |
- Use code blocks with \`\`\`language only when showing actual code
- Write concisely - prioritize clarity over exhaustive detail

CRITICAL RULES:
- NEVER use HTML tags (<table>, <tr>, <td>, <div>, <text>, <list>, etc.)
- NEVER mention page numbers or use citation tags
- NEVER create deeply nested hierarchies (a.1.i.A style)
- Keep responses scannable and digestible
- If the answer isn't in the context, state it clearly
- Provide analytical responses based strictly on the context

Context:
"""
${context}
"""

User Query: "${query}"
`;

    try {
        const result = await aiModel.generateContentStream(systemPrompt);
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
