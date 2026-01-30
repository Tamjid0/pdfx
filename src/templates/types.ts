import { PreviewData } from '../utils/contentTransformer';

export interface DocumentTemplate {
    id: string;
    name: string;
    css: string;
    render: (data: PreviewData) => string;
}
