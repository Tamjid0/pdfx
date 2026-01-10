// src/services/apiService.ts
export async function formatContent(html: string, prompt: string) {
    const response = await fetch('/api/v1/format', {
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
    const response = await fetch('/api/v1/summary', {
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
    const response = await fetch('/api/v1/templates');
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
}

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/upload/upload-document', {
        method: 'POST',
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, fileName }),
    });

    if (!response.ok) {
        throw new Error('Failed to embed text');
    }
    return response.json();
}

export async function fetchNotes(arg1: GenerationPayload, settings?: any) {
    const payload = getPayload(arg1, settings);
    const response = await fetch('/api/v1/notes', {
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
    const response = await fetch('/api/v1/flashcards', {
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
    const response = await fetch('/api/v1/quiz', {
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
    const response = await fetch('/api/v1/mindmap', {
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
    const response = await fetch('/api/v1/insights', {
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
    const response = await fetch('/api/v1/export', {
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
    const response = await fetch('/api/v1/chat', {
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

export async function chatWithDocumentStream(message: string, fileId: string, onChunk: (text: string) => void, onComplete: (fullText: string) => void) {
    const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
