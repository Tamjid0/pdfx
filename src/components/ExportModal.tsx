import React, { useState } from 'react';
import {
    useStore, type SummaryData, type NotesData, type InsightsData,
    type FlashcardsData, type QuizData, type MindmapData, type PreviewPreset
} from '../store/useStore';
import { getExportStyles } from '../utils/exportStyles';
import { getTemplate } from '../templates';
import { transformModeContent } from '../utils/contentTransformer';

interface ExportModalProps { }

export const ExportModal: React.FC<ExportModalProps> = () => {
    const {
        showExportModal,
        closeExportModal,
        exportMode,
        exportContent,
        previewPreset
    } = useStore();

    const [isExporting, setIsExporting] = useState(false);

    if (!showExportModal || !exportContent) return null;

    const mode = exportMode;
    const data = exportContent;

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
            if (format === 'pdf' && (!contentType || !contentType.includes('application/pdf'))) {
                console.error('[Export] Expected PDF but got:', contentType);
                throw new Error(`Server returned unexpected content type: ${contentType}`);
            }
            if (format === 'docx' && (!contentType || !contentType.includes('application/vnd.openxmlformats'))) {
                console.error('[Export] Expected DOCX but got:', contentType);
                throw new Error(`Server returned unexpected content type: ${contentType}`);
            }

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
            alert(error instanceof Error ? error.message : 'Failed to export document. Please try again.');
        } finally {
            setIsExporting(false);
        }
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
