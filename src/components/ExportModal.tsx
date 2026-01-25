
import React, { useState } from 'react';
import { useStore } from '../store/useStore';

interface ExportModalProps { }

export const ExportModal: React.FC<ExportModalProps> = () => {
    const {
        showExportModal,
        closeExportModal,
        exportMode,
        exportContent
    } = useStore();

    const [isExporting, setIsExporting] = useState(false);

    if (!showExportModal || !exportContent) return null;

    const mode = exportMode;
    const data = exportContent;

    const renderDataToHtml = (mode: string, data: any): string => {
        if (mode === 'editor') return data || '';
        if (!data) return '<h1>No content available</h1>';

        try {
            switch (mode) {
                case 'summary':
                    return `
                        <h1>Executive Summary</h1>
                        <div>${data.summary || '<i>No summary content available.</i>'}</div>
                        <h2>Key Highlights</h2>
                        <ul>${(data.keyPoints && data.keyPoints.length > 0)
                            ? data.keyPoints.map((p: string) => `<li>${p}</li>`).join('')
                            : '<li>No key points available.</li>'}</ul>
                    `;
                case 'notes':
                    return `
                        <h1>Study Notes</h1>
                        ${(data.notes && data.notes.length > 0)
                            ? data.notes.map((s: any) => `
                                <h2>${s.section || 'Unstructured Section'}</h2>
                                <ul>${(s.points || []).map((p: string) => `<li>${p}</li>`).join('')}</ul>
                            `).join('') : '<p>No notes available.</p>'}
                    `;
                case 'insights':
                    return `
                        <h1>Core Insights</h1>
                        ${(data.insights && data.insights.length > 0)
                            ? data.insights.map((i: any) => `
                                <h3>${i.title || 'Untitled Insight'}</h3>
                                <p>${i.description || ''}</p>
                            `).join('') : '<p>No insights available.</p>'}
                    `;
                case 'flashcards':
                    return `
                        <h1>Flashcards</h1>
                        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            ${(data.flashcards && data.flashcards.length > 0)
                            ? data.flashcards.map((f: any) => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; width: 40%; background: #f9f9f9;">${f.front || ''}</td>
                                        <td style="border: 1px solid #ddd; padding: 12px;">${f.back || ''}</td>
                                    </tr>
                                `).join('') : '<tr><td>No flashcards available.</td></tr>'}
                        </table>
                    `;
                case 'quiz':
                    return `
                        <h1>Quiz Assessment</h1>
                        ${(data.quiz && data.quiz.length > 0)
                            ? data.quiz.map((q: any, idx: number) => `
                                <div style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                                    <p style="font-size: 1.1em;"><strong>Question ${idx + 1}: ${q.question || '...'}</strong></p>
                                    ${q.type === 'mc' ? `
                                        <ul style="list-style-type: none; padding-left: 20px;">
                                            ${(q.options || []).map((o: any) => `<li style="margin-bottom: 8px;">[ ] ${o.label}: ${o.value}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                    <p style="color: #666; font-size: 0.9em; margin-top: 10px;"><i>Correct Answer: ${q.correctAnswer || 'Not provided'}</i></p>
                                </div>
                            `).join('') : '<p>No quiz questions available.</p>'}
                    `;
                case 'mindmap':
                    return `
                        <h1>Mind Map Structure</h1>
                        <ul>${(data.nodes && data.nodes.length > 0)
                            ? data.nodes.map((n: any) => `<li>${n.data?.label || n.id}</li>`).join('')
                            : '<li>No mind map nodes available.</li>'}</ul>
                    `;
                default:
                    return typeof data === 'string' ? data : JSON.stringify(data);
            }
        } catch (err) {
            console.error('Error rendering data to HTML:', err);
            return `<h1>Error rendering content</h1><p>${JSON.stringify(data)}</p>`;
        }
    };

    const handleExportAction = async (format: 'pdf' | 'docx' | 'csv') => {
        setIsExporting(true);
        try {
            const body: any = {
                format,
                filename: `pdfy-${mode}-${new Date().getTime()}`,
                mode,
            };

            // Ensure we have HTML for PDF/DOCX
            if (format === 'pdf' || format === 'docx') {
                body.html = wrapInStyle(renderDataToHtml(mode, data));
            } else if (format === 'csv') {
                body.data = data;
            }

            const response = await fetch('/api/v1/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${body.filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            closeExportModal();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export document. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const wrapInStyle = (html: string) => {
        return `
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        h1, h2, h3 { color: #111; }
                        .preview-list { list-style: none; padding: 0; }
                        .preview-list-item { margin-bottom: 12px; }
                        img { max-width: 100%; height: auto; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                    </style>
                </head>
                <body>${html}</body>
            </html>
        `;
    };

    const getOptions = () => {
        const options = [
            { id: 'pdf', label: 'PDF Document', icon: '📄', desc: 'High-fidelity PDF for printing', format: 'pdf' },
            { id: 'docx', label: 'Word Document', icon: '📝', desc: 'Editable Microsoft Word file', format: 'docx' },
        ];

        if (mode === 'quiz' || (mode === 'preview' && data?.quiz)) {
            options.push({ id: 'csv', label: 'CSV Spreadsheet', icon: '📊', desc: 'Results in a spreadsheet format', format: 'csv' });
        }

        return options;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => !isExporting && closeExportModal()}
            />

            <div className="relative w-full max-w-md bg-gemini-dark-200 border border-gemini-dark-500 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gemini-dark-400 bg-gemini-dark-300 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Export Options</h2>
                        <p className="text-xs text-gemini-gray mt-1">Select your preferred format for {mode}</p>
                    </div>
                    <button
                        onClick={() => closeExportModal()}
                        className="p-2 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"
                        disabled={isExporting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {getOptions().map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleExportAction(opt.format as any)}
                            disabled={isExporting}
                            className={`w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'bg-gemini-dark-300 border-gemini-dark-500 hover:border-gemini-green hover:bg-gemini-green/5'}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gemini-dark-400 rounded-xl group-hover:bg-gemini-green/10 transition-colors">
                                {opt.icon}
                            </div>
                            <div className="text-left flex-1">
                                <div className="text-sm font-bold text-white group-hover:text-gemini-green transition-colors">{opt.label}</div>
                                <div className="text-xs text-gemini-gray">{opt.desc}</div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 text-gemini-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {isExporting && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-50">
                        <div className="w-12 h-12 border-4 border-gemini-green border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-semibold text-white">Generating your file...</p>
                        <p className="text-xs text-gemini-gray mt-1">This may take a few seconds</p>
                    </div>
                )}
            </div>
        </div>
    );
};
