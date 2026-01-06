// src/services/apiService.ts
export async function formatContent(html: string, prompt: string) {
    const response = await fetch('/api/format', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html, prompt }),
    });
    if (!response.ok) {
        throw new Error('Failed to format content');
    }
    return response.json();
}

type GenerationPayload = { text?: string; fileId?: string; settings?: any } | string;

function getPayload(arg1: GenerationPayload, arg2?: any) {
    if (typeof arg1 === 'string') {
        return { text: arg1, settings: arg2 || {} };
    }
    return arg1;
}

export async function generateSummary(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to generate summary');
    }
    return response.json();
}

export async function fetchTemplates() {
    const response = await fetch('/api/templates');
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
}

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }
    return response.json();
}

export async function fetchNotes(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    return response.json();
}

export async function fetchFlashcards(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
    }
    return response.json();
}

export async function fetchQuiz(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch quiz');
    }
    return response.json();
}

export async function fetchMindmap(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch mindmap');
    }
    return response.json();
}

export async function fetchInsights(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch insights');
    }
    return response.json();
}

export async function exportContent(content: string, format: string, mode: string) {
    const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, format, mode }),
    });
    if (!response.ok) {
        throw new Error(`Failed to export content as ${format} for mode ${mode}`);
    }
    // Depending on the format, the response might be a file stream or a JSON object
    return response;
}

export async function chatWithDocument(message: string, fileId: string) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, fileId }),
    });
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
}
