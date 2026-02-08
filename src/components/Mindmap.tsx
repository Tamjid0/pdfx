import React, { useEffect, useState } from 'react';
import { useStore, type MindmapData, type MindmapNode, type MindmapEdge, type Mode } from '../store/useStore';
import ReactFlow, { useNodesState, useEdgesState, MiniMap, Controls, Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled';
import { ModeContainer } from './shared/ModeContainer';
import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';

interface MindmapProps {
    data: MindmapData | null;
    onGenerate: (mode: Mode) => void;
    historyActions?: React.ReactNode;
    interactiveAction?: React.ReactNode;
    toolsAction?: React.ReactNode;
}

const elk = new ELK();

const getLayoutedElements = (nodes: any[], edges: any[], options = {}) => {
    const graph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'org.eclipse.elk.radial',
            'elk.spacing.nodeNode': '80',
            ...options
        },
        children: nodes.map((node) => ({
            ...node,
            // Adjust width and height for elkjs
            width: 150,
            height: 50,
        })),
        edges: edges,
    };

    return elk
        .layout(graph)
        .then((layoutedGraph: any) => ({
            nodes: layoutedGraph.children.map((node: any) => ({
                ...node,
                // React-flow uses position and not x, y
                position: { x: node.x, y: node.y },
            })),
            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
};


const Mindmap: React.FC<MindmapProps> = ({
    data,
    onGenerate,
    historyActions,
    interactiveAction,
    toolsAction
}) => {
    const { isGeneratingMindmap, addLocalDraft, switchRevision, openExportModal } = useStore();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (data && data.nodes && data.edges) {
            getLayoutedElements(data.nodes, data.edges).then(({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
                const styledNodes = layoutedNodes.map((node: any) => ({
                    ...node,
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '2px solid #00ff88',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '13px',
                        fontWeight: '600',
                    }
                }));

                const styledEdges = layoutedEdges.map((edge: any) => ({
                    ...edge,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#00ff88',
                    },
                    style: {
                        stroke: '#00ff88',
                        strokeWidth: 2,
                    }
                }));

                setNodes(styledNodes);
                setEdges(styledEdges);
            });
        }
    }, [data, setNodes, setEdges]);

    const hasData = data && data.nodes && data.nodes.length > 0;

    return (
        <ModeContainer
            module="mindmap"
            title="Neural Network"
            isGenerating={isGeneratingMindmap}
            hasData={hasData}
            onGenerate={onGenerate}
            onExport={() => hasData && openExportModal('mindmap', data)}
            historyActions={historyActions}
            interactiveAction={interactiveAction}
            toolsAction={toolsAction}
        >
            <div className="w-full h-full relative">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center min-h-full text-center pt-2 px-8 pb-8 bg-[#0a0a0a] rounded-xl overflow-y-auto custom-scrollbar">
                        <div className="p-4 max-w-2xl mx-auto w-full space-y-6">
                            <div className="text-center space-y-3 pt-2">
                                <div className="w-14 h-14 bg-[#00ff88]/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#00ff88]/10 shadow-2xl">
                                    <svg className="w-7 h-7 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V5l12-2v14l-12 2zM9 19l-6-2V3l6 2m0 14V5" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Mindmap</h3>
                            </div>

                            {isGeneratingMindmap ? (
                                <div className="w-full space-y-6 animate-pulse">
                                    <div className="h-32 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Mapping Nodes...</span>
                                    </div>
                                    <LocalizedShimmer blocks={1} />
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-sm mx-auto w-full">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6">
                                        <GenerationScopeSelector className="!space-y-4" />
                                    </div>

                                    <button
                                        onClick={() => onGenerate('mindmap')}
                                        className="px-12 py-4 bg-[#00ff88] text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] flex items-center justify-center gap-3 w-full"
                                    >
                                        GENERATE MINDMAP
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            fitView
                        >
                            <MiniMap
                                style={{ background: '#111', border: '1px solid #222' }}
                                nodeColor={(n) => '#00ff88'}
                                maskColor="rgba(0,0,0,0.7)"
                            />
                            <Controls className="bg-[#111] border-[#222] border fill-white" />
                            <Background color="#222" gap={20} />
                        </ReactFlow>
                    </div>
                )}
            </div>
        </ModeContainer>
    );
};

export default Mindmap;
