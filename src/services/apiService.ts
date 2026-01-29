// src/services/apiService.ts
import {
    SummaryData, NotesData, FlashcardsData, QuizData, MindmapData, InsightsData,
    Topic, GenerationScope, DocumentOverview
} from '../store/useStore';
import { auth } from '../lib/firebase';

async function getAuthHeaders(headers: Record<string, string> = {}) {
    const user = auth.currentUser;
    const bearerHeaders: Record<string, string> = { ...headers };

    if (user) {
        const token = await user.getIdToken();
        bearerHeaders['Authorization'] = `Bearer ${token}`;
    }

    return bearerHeaders;
}

export async function formatContent(html: string, prompt: string) {
    const response = await fetch('/api/v1/format', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ html, prompt }),
    });
    if (!response.ok) {
        throw new Error('Failed to format content');
    }
    return response.json();
}

type GenerationPayload = {
    text?: string;
    fileId?: string;
    settings?: Record<string, any>;
    scope?: GenerationScope;
} | string;

function getPayload(arg1: GenerationPayload, arg2?: Record<string, any>): { text?: string; fileId?: string; settings?: Record<string, any>; scope?: GenerationScope } {
    if (typeof arg1 === 'string') {
        return { text: arg1, settings: arg2 || {} };
    }
    return arg1;
}

export async function generateSummary(arg1: GenerationPayload, settings?: Record<string, any>): Promise<SummaryData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/summary', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to generate summary');
    }
    return response.json();
}

export async function fetchTemplates() {
    const response = await fetch('/api/v1/templates', {
        headers: await getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
}

export async function uploadFile(file: File, userId?: string) {
    const formData = new FormData();
    if (userId) {
        formData.append('userId', userId);
    }
    formData.append('file', file);

    const response = await fetch('/api/v1/upload/upload-document', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }
    return response.json();
}

export async function embedText(text: string, fileName?: string) {
    const response = await fetch('/api/v1/upload/embed-text', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ text, fileName }),
    });

    if (!response.ok) {
        throw new Error('Failed to embed text');
    }
    return response.json();
}

export async function fetchNotes(arg1: GenerationPayload, settings?: Record<string, any>): Promise<NotesData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    return response.json();
}

export async function fetchFlashcards(arg1: GenerationPayload, settings?: Record<string, any>): Promise<FlashcardsData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/flashcards', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
    }
    return response.json();
}

export async function fetchQuiz(arg1: GenerationPayload, settings?: Record<string, any>): Promise<QuizData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/quiz', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch quiz');
    }
    return response.json();
}

export async function fetchMindmap(arg1: GenerationPayload, settings?: Record<string, any>): Promise<MindmapData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/mindmap', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch mindmap');
    }
    return response.json();
}

export async function fetchInsights(arg1: GenerationPayload, settings?: Record<string, any>): Promise<InsightsData> {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/insights', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch insights');
    }
    return response.json();
}

export async function exportContent(content: string, format: string, mode: string) {
    const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ content, format, mode }),
    });
    if (!response.ok) {
        throw new Error(`Failed to export content as ${format} for mode ${mode}`);
    }
    // Depending on the format, the response might be a file stream or a JSON object
    return response;
}

export async function chatWithDocument(message: string, fileId: string) {
    const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ message, fileId }),
    });
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
}

export async function chatWithDocumentStream(message: string, fileId: string, onChunk: (text: string) => void, onComplete: (fullText: string) => void) {
    const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: await getAuthHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ message, fileId }),
    });

    if (!response.ok) {
        throw new Error('Failed to initiate streaming chat');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (!reader) return;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.text) {
                            fullText += data.text;
                            onChunk(data.text);
                        }
                    } catch (e) {
                        // Ignore parsing errors for partial JSON or other events
                    }
                } else if (line.startsWith('event: end')) {
                    onComplete(fullText);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

export async function getJobStatus(jobId: string) {
    const response = await fetch(`/api/v1/jobs/${jobId}`, {
        headers: await getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch job status');
    }
    return response.json();
}

/**
 * Syncs workspace content (Chat, Summary, etc.) to the backend
 */
export async function syncProjectContent(
    documentId: string,
    content: SummaryData | NotesData | InsightsData | QuizData | FlashcardsData | MindmapData | {
        chatHistory?: { role: 'user' | 'assistant' | 'ai'; content: string; timestamp?: string }[],
        summaryData?: SummaryData,
        notesData?: NotesData,
        insightsData?: InsightsData,
        quizData?: QuizData,
        flashcardsData?: FlashcardsData,
        mindmapData?: MindmapData
    },
    options?: { append?: boolean, scope?: GenerationScope, versionName?: string }
) {
    const response = await fetch(`/api/v1/documents/${documentId}/sync`, {
        method: 'POST',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...content, ...options }),
    });
    if (!response.ok) {
        throw new Error('Failed to sync project content');
    }
    return response.json();
}

/**
 * Fetches all documents (projects) for a specific user
 */
export async function fetchUserDocuments(userId: string, limit: number = 20, offset: number = 0): Promise<{ data: DocumentOverview[], pagination: any }> {
    const response = await fetch(`/api/v1/documents?userId=${userId}&limit=${limit}&offset=${offset}`, {
        headers: await getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch documents');
    }
    const result = await response.json();
    return result;
}
