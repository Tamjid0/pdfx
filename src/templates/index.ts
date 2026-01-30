import { ProfessionalTemplate } from './professional.template';
import { AcademicTemplate } from './academic.template';
import { MinimalTemplate } from './minimal.template';
import { CreativeTemplate } from './creative.template';
import { DocumentTemplate } from './types';
import { PreviewPreset } from '../store/useStore';

export const templates: Record<PreviewPreset, DocumentTemplate> = {
    professional: ProfessionalTemplate,
    academic: AcademicTemplate,
    minimal: MinimalTemplate,
    creative: CreativeTemplate,
};

export function getTemplate(preset: PreviewPreset): DocumentTemplate {
    return templates[preset] || ProfessionalTemplate;
}

export * from './types';
