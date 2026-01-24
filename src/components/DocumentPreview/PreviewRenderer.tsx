import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { transformModeContent, type PreviewData } from '../../utils/contentTransformer';
import {
    ProfessionalPreset,
    AcademicPreset,
    MinimalPreset,
    CreativePreset
} from './presets/Presets';

interface PreviewRendererProps {
    mode: string;
    data: any;
}

/**
 * PreviewRenderer
 * Dynamically renders mode content using the selected preset
 * Memoized for performance
 */
export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ mode, data }) => {
    const { previewPreset } = useStore();

    // Transform mode data to preview format (memoized)
    const previewData = useMemo<PreviewData | null>(() => {
        if (!data) return null;
        return transformModeContent(mode, data);
    }, [mode, data]);

    // Select preset component
    const PresetComponent = useMemo(() => {
        switch (previewPreset) {
            case 'professional':
                return ProfessionalPreset;
            case 'academic':
                return AcademicPreset;
            case 'minimal':
                return MinimalPreset;
            case 'creative':
                return CreativePreset;
            default:
                return ProfessionalPreset;
        }
    }, [previewPreset]);

    // Handle empty or invalid data
    if (!previewData || !previewData.sections || previewData.sections.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
                    <p className="text-gray-500 text-sm">No content available for preview</p>
                    <p className="text-gray-400 text-xs mt-2">Generate content first to see the preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white">
            <PresetComponent data={previewData} />
        </div>
    );
};
