import React from 'react';
import { SummaryBlock } from './blocks/SummaryBlock';
import { TextBlock } from './blocks/TextBlock';
import { KeywordsBlock } from './blocks/KeywordsBlock';
import { DefinitionBlock } from './blocks/DefinitionBlock';
import { ExplanationBlock } from './blocks/ExplanationBlock';
import { FormulaBlock } from './blocks/FormulaBlock';
import { ExampleBlock } from './blocks/ExampleBlock';
import { QuizBlock } from './blocks/QuizBlock';

export interface NoteBlock {
    type: string;
    title?: string;
    content?: string | any;
    items?: any[];
    icon?: string;
    [key: string]: any;
}

interface NoteBlockRendererProps {
    blocks: NoteBlock[];
}

export const NoteBlockRenderer: React.FC<NoteBlockRendererProps> = ({ blocks }) => {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="notes-container max-w-[1000px] mx-auto bg-[#0a0a0a] rounded-[24px] overflow-hidden font-sans border border-[#222]">
            {/* Header removed from here as it is handled by the parent component (Notes.tsx) */}

            <div className="content p-[20px] md:p-[40px] space-y-8">
                {blocks.map((block, index) => {
                    switch (block.type) {
                        case 'summary':
                        case 'overview':
                            return (
                                <SummaryBlock
                                    key={index}
                                    title={block.title}
                                    content={block.content as string}
                                />
                            );

                        case 'text':
                        case 'context':
                        case 'historical':
                            return (
                                <TextBlock
                                    key={index}
                                    title={block.title}
                                    content={block.content as string}
                                />
                            );

                        case 'keywords':
                        case 'tags':
                            const tags = Array.isArray(block.items)
                                ? block.items.map((item: any) => typeof item === 'string' ? item : item.term || item.label)
                                : (Array.isArray(block.content) ? block.content : []);
                            return <KeywordsBlock key={index} title={block.title} tags={tags} />;

                        case 'definitions':
                            return <DefinitionBlock key={index} title={block.title} items={block.items || []} />;

                        case 'explanation':
                        case 'deep_dive':
                            return <ExplanationBlock key={index} title={block.title} content={block.content as string} />;

                        case 'formulas':
                            return <FormulaBlock key={index} title={block.title} items={block.items || []} />;

                        case 'examples':
                            return <ExampleBlock key={index} title={block.title} items={block.items || []} content={block.content as string} />;

                        case 'quiz':
                        case 'questions':
                            return <QuizBlock key={index} title={block.title} items={block.items || []} />;

                        default:
                            if (block.content) {
                                return (
                                    <TextBlock
                                        key={index}
                                        title={block.title || "Section"}
                                        content={typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
                                        icon="📝"
                                    />
                                );
                            }
                            return null;
                    }
                })}
            </div>

            <div className="p-8 text-center border-t border-white/5">
                <div className="flex items-center justify-center gap-2 opacity-30">
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                    <span className="text-[10px] uppercase tracking-[0.3em]">End of Notes</span>
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
            </div>
        </div>
    );
};
