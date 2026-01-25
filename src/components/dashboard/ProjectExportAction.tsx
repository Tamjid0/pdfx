import React, { useState } from 'react';
import { useStore, type PreviewPreset } from '../../store/useStore';

interface ProjectExportActionProps {
    mode: string;
    data: any;
    filename: string;
}

const ProjectExportAction: React.FC<ProjectExportActionProps> = ({ mode, data, filename }) => {
    const { previewPreset, setPreviewPreset } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const presets: { value: PreviewPreset; label: string; icon: string }[] = [
        { value: 'professional', label: 'Professional', icon: '💼' },
        { value: 'academic', label: 'Academic', icon: '🎓' },
        { value: 'minimal', label: 'Minimal', icon: '⚡' },
        { value: 'creative', label: 'Creative', icon: '🎨' },
    ];

    const currentPreset = presets.find(p => p.value === previewPreset) || presets[0];

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

    const handleExportAction = async (format: 'pdf' | 'docx') => {
        setIsExporting(true);
        setIsOpen(false);
        try {
            const body: any = {
                format,
                filename: `${filename}-${mode}-${new Date().getTime()}`,
                mode,
            };

            body.html = wrapInStyle(renderDataToHtml(mode, data));

            const response = await fetch('/api/v1/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: body.html,
                    format: format,
                    mode: mode
                }),
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
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export document. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative inline-block z-10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={!data || isExporting}
                className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all border border-white/5 disabled:opacity-20 active:scale-95 ${isOpen ? 'bg-white/15 border-white/20' : ''}`}
            >
                {isExporting ? (
                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                Export {mode}
                <svg className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">Style Preset</span>
                        <div className="mt-2 grid grid-cols-1 gap-1">
                            {presets.map(preset => (
                                <button
                                    key={preset.value}
                                    onClick={() => setPreviewPreset(preset.value)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${previewPreset === preset.value ? 'bg-gemini-green/10 text-gemini-green' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{preset.icon}</span>
                                        <span>{preset.label}</span>
                                    </div>
                                    {previewPreset === preset.value && <div className="w-1.5 h-1.5 rounded-full bg-gemini-green shadow-[0_0_8px_rgba(0,255,136,0.6)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => handleExportAction('pdf')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black text-white hover:bg-gemini-green hover:text-black transition-all group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-black/10">
                                📄
                            </div>
                            Download as PDF
                        </button>
                        <button
                            onClick={() => handleExportAction('docx')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-all group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                                📝
                            </div>
                            Download as Word
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectExportAction;
