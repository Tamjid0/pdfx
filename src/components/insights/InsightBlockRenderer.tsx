import React from 'react';
import { SynthesisBlock } from './blocks/SynthesisBlock';
import { GapAnalysisBlock } from './blocks/GapAnalysisBlock';
import { ActionableBlock } from './blocks/ActionableBlock';
import { KeyStatBlock } from './blocks/KeyStatBlock';
import { TrendBlock } from './blocks/TrendBlock';

interface InsightBlock {
    type: string;
    title?: string;
    subtitle?: string;
    content?: string | string[];
    items?: any[];
    stats?: any[];
    badges?: any[];
    steps?: any[];
    implication?: string;
    [key: string]: any;
}

interface InsightBlockRendererProps {
    blocks: InsightBlock[];
}

export const InsightBlockRenderer: React.FC<InsightBlockRendererProps> = ({ blocks }) => {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="space-y-6">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'synthesis':
                    case 'hidden_connection':
                        return (
                            <SynthesisBlock
                                key={index}
                                title={block.title}
                                subtitle={block.subtitle}
                                content={block.content}
                            />
                        );

                    case 'gap_analysis':
                        return (
                            <GapAnalysisBlock
                                key={index}
                                title={block.title}
                                subtitle={block.subtitle}
                                content={block.content}
                                items={block.items}
                                badges={block.badges}
                            />
                        );

                    case 'actionable':
                    case 'takeaway':
                        return (
                            <ActionableBlock
                                key={index}
                                title={block.title}
                                subtitle={block.subtitle}
                                content={block.content}
                                steps={block.items || block.steps} // Handle both array fields for robustness
                            />
                        );

                    case 'key_stat':
                    case 'statistics':
                        return (
                            <KeyStatBlock
                                key={index}
                                title={block.title}
                                subtitle={block.subtitle}
                                content={block.content}
                                stats={block.items || block.stats}
                            />
                        );

                    case 'trend':
                    case 'emerging_trend':
                        return (
                            <TrendBlock
                                key={index}
                                title={block.title}
                                subtitle={block.subtitle}
                                content={block.content}
                                implication={block.implication}
                            />
                        );

                    default:
                        // Fallback for unknown blocks - reuse Synthesis style for safety
                        return (
                            <div key={index} className="bg-[#111] border border-[#222] rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">{block.title || "Insight"}</h3>
                                <div dangerouslySetInnerHTML={{ __html: block.content || "" }} className="text-sm text-gray-400" />
                            </div>
                        );
                }
            })}

            <div className="p-8 text-center border-t border-white/5 opacity-50">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">End of Analysis</p>
            </div>
        </div>
    );
};
