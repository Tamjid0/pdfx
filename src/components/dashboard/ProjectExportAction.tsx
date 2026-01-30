import React, { useState } from 'react';
import {
    useStore, type SummaryData, type NotesData, type InsightsData,
    type FlashcardsData, type QuizData, type MindmapData, type PreviewPreset, type Revision
} from '../../store/useStore';
import { getExportStyles } from '../../utils/exportStyles';
import { getTemplate } from '../../templates';
import { transformModeContent } from '../../utils/contentTransformer';
import { toast } from 'react-hot-toast';

interface ProjectExportActionProps {
    mode: string;
    data: SummaryData | NotesData | InsightsData | FlashcardsData | QuizData | MindmapData | string | null;
    filename: string;
    documentId: string;
    revisions?: Revision<any>[];
    activeDropdown: string | null;
    setActiveDropdown: (mode: string | null) => void;
}

const ProjectExportAction: React.FC<ProjectExportActionProps> = ({
    mode, data, filename, documentId, revisions = [], activeDropdown, setActiveDropdown
}) => {
    const { fileId, refreshCurrentProject, updateRevisionsFromSync, previewPreset, setPreviewPreset, topics } = useStore();
    const [selectedVersion, setSelectedVersion] = useState<string>('current');
    const [isExporting, setIsExporting] = useState(false);

    const isOpen = activeDropdown === mode;

    const toggleDropdown = () => {
        if (isOpen) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(mode);
        }
    };

    const getScopeLabel = (scope: any) => {
        if (!scope || scope.type === 'all') return 'Full Document';
        if (scope.type === 'pages') return `Pages ${scope.value[0]} -${scope.value[1]} `;
        if (scope.type === 'topics') {
            const topicIds: string[] = Array.isArray(scope.value) ? scope.value : [];
            if (topicIds.length === 0) return 'Selected Topics';
            if (topicIds.length === 1) {
                const topic = topics.find(t => t.id === topicIds[0]);
                return topic ? `${topic.label} ` : 'Selected Topic';
            }
            return `${topicIds.length} Topics`;
        }
        return 'Custom Scope';
    };

    const presets: { value: PreviewPreset; label: string; icon: string }[] = [
        { value: 'professional', label: 'Professional', icon: '💼' },
        { value: 'academic', label: 'Academic', icon: '🎓' },
        { value: 'minimal', label: 'Minimal', icon: '⚡' },
        { value: 'creative', label: 'Creative', icon: '🎨' },
    ];

    const currentPreset = presets.find(p => p.value === previewPreset) || presets[0];

    const renderDataToHtml = (
        mode: string,
        data: any
    ): string => {
        if (mode === 'editor') return (data as string) || '';
        if (!data) return '<h1>No content available</h1>';

        const previewData = transformModeContent(mode, data);
        if (!previewData) return '<h1>Unable to process content for export</h1>';

        const template = getTemplate(previewPreset);
        return template.render(previewData);
    };

    const wrapInStyle = (html: string) => {
        const styles = getExportStyles(previewPreset);
        console.log(`[ProjectExportAction] Wrapping in styles for preset: ${previewPreset}`);

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Exported Content</title>
                    <style>${styles}</style>
                </head>
                <body class="export-body">${html}</body>
            </html>
        `;
    };

    const handleExportAction = async (format: 'pdf' | 'docx' | 'csv') => {
        setIsExporting(true);
        setActiveDropdown(null);
        try {
            // Get the data to export based on selected version
            let exportData = data;
            if (selectedVersion !== 'current' && revisions.length > 0) {
                const revision = revisions.find(r => r.id === selectedVersion);
                if (revision) {
                    exportData = revision.content;
                }
            }

            const body: any = {
                format,
                filename: `${filename}-${mode}-${new Date().getTime()}`,
                mode,
            };

            body.html = wrapInStyle(renderDataToHtml(mode, exportData));

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

            if (!response.ok) {
                // Check if response is JSON error
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Export failed');
                }
                throw new Error('Export failed');
            }

            // Verify we got the correct content type
            const contentType = response.headers.get('content-type');
            const expectedType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            if (!contentType || !contentType.includes(expectedType)) {
                console.error('[Export] Unexpected content-type:', contentType);
                throw new Error(`Server returned unexpected content type: ${contentType}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${body.filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} exported successfully`);
        } catch (error) {
            console.error('[Export] Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to export document');
        } finally {
            setIsExporting(false);
        }
    };

    const hasContent = (d: any): boolean => {
        if (!d) return false;
        if (typeof d === 'string') return d.trim().length > 0;

        // Handle specific types
        if (mode === 'summary') return !!(d.summary || (d.keyPoints && d.keyPoints.length > 0));
        if (mode === 'notes') return !!(d.notes && d.notes.length > 0);
        if (mode === 'insights') return !!(d.insights && d.insights.length > 0);
        if (mode === 'flashcards') return !!(d.flashcards && d.flashcards.length > 0);
        if (mode === 'quiz') return !!(d.quiz && d.quiz.length > 0);
        if (mode === 'mindmap') return !!(d.nodes && d.nodes.length > 0);

        return true;
    };

    return (
        <div className="relative inline-block z-10">
            <button
                onClick={toggleDropdown}
                disabled={!hasContent(data) || isExporting}
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
                <div className="absolute top-full right-0 mt-3 w-64 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Version Selection */}
                    {revisions.length > 0 && (
                        <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">Select Version</span>
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                                <button
                                    onClick={() => setSelectedVersion('current')}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${selectedVersion === 'current' ? 'bg-gemini-green/10 text-gemini-green' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span>Current Version</span>
                                        <span className="text-[8px] text-white/30 uppercase tracking-tighter">Latest Extraction</span>
                                    </div>
                                    {selectedVersion === 'current' && <div className="w-1.5 h-1.5 rounded-full bg-gemini-green shadow-[0_0_8px_rgba(0,255,136,0.6)]"></div>}
                                </button>
                                {revisions.map((rev: any) => (
                                    <button
                                        key={rev.id}
                                        onClick={() => setSelectedVersion(rev.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${selectedVersion === rev.id ? 'bg-gemini-green/10 text-gemini-green' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span>{new Date(rev.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                        {selectedVersion === rev.id && <div className="w-1.5 h-1.5 rounded-full bg-gemini-green shadow-[0_0_8px_rgba(0,255,136,0.6)]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Style Preset */}
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
