import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { transformModeContent, type PreviewData } from '../../utils/contentTransformer';
import { getTemplate } from '../../templates';
import { getExportStyles } from '../../utils/exportStyles';

interface PreviewRendererProps {
    mode: string;
    data: any;
}

/**
 * PreviewRenderer
 * Dynamically renders mode content using the template system
 * Guaranteed to match PDF export output
 */
export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ mode, data }) => {
    const { previewPreset } = useStore();

    // Transform mode data to preview format (memoized)
    const previewData = useMemo<PreviewData | null>(() => {
        if (!data) return null;
        return transformModeContent(mode, data);
    }, [mode, data]);

    // Generate full HTML string for the preview (memoized)
    const previewHtml = useMemo(() => {
        if (!previewData) return '';

        const template = getTemplate(previewPreset);
        const styles = getExportStyles(previewPreset);
        const content = template.render(previewData);

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        ${styles}
                        body { 
                            background: white !important; 
                        }
                        .template-container {
                            box-shadow: none !important;
                            border: none !important;
                            padding-top: 20px !important;
                        }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `;
    }, [previewData, previewPreset]);

    // Handle empty or invalid data
    if (!previewData || (!previewData.sections?.length && !(previewData as any).presentationData)) {
        return (
            <div className="flex items-center justify-center h-full bg-gemini-dark-300">
                <div className="text-center p-8">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-gray-400 text-sm">No content available for preview</p>
                    <p className="text-gray-500 text-xs mt-2">Generate content first to see the preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-white transition-opacity duration-300">
            <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-none shadow-inner"
                title="Template Preview"
                sandbox="allow-same-origin"
            />
        </div>
    );
};
