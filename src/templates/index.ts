import { StudyTemplate } from './study.template';
import { PresentationTemplate } from './presentation.template';
import { DocumentTemplate } from './types';
import { PreviewPreset } from '../store/useStore';

export const templates: Record<PreviewPreset, DocumentTemplate> = {
    study: StudyTemplate,
    presentation: PresentationTemplate,
};

export function getTemplate(preset: PreviewPreset): DocumentTemplate {
    return templates[preset] || StudyTemplate;
}

export * from './types';
