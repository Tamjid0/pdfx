import React, { useEffect } from 'react';
import { useStore, type MindmapData, type MindmapNode, type MindmapEdge } from '../store/useStore';
import ReactFlow, { useNodesState, useEdgesState, MiniMap, Controls, Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { VersionTabs } from './dashboard/VersionTabs';

interface MindmapProps {
    data: MindmapData | null;
    onGenerate: (mode: 'mindmap') => void;
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


import LocalizedShimmer from './LocalizedShimmer';
import GenerationScopeSelector from './dashboard/GenerationScopeSelector';

const Mindmap: React.FC<MindmapProps> = ({ data, onGenerate }) => {
    const { isGeneratingMindmap, addLocalDraft, switchRevision } = useStore();
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
        <div className="flex flex-col h-full w-full bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{hasData ? 'Neural Network' : 'Graph Sync'}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (hasData) {
                                if (window.confirm('Are you sure you want to regenerate? This will start a new session.')) {
                                    onGenerate('mindmap');
                                }
                            } else {
                                onGenerate('mindmap');
                            }
                        }}
                        disabled={isGeneratingMindmap}
                        className="px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-xs font-bold hover:bg-[#00ff88]/10 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGeneratingMindmap ? (
                            <div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        {isGeneratingMindmap ? 'MAPPING...' : (hasData ? 'REGENERATE' : 'SETUP')}
                    </button>
                </div>
            </div>

            <VersionTabs module="mindmap" />

            <div className="flex-1 min-h-0 relative">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center min-h-full text-center p-8 bg-[#0a0a0a] rounded-xl overflow-y-auto custom-scrollbar">
                        <div className="p-10 max-w-2xl mx-auto w-full space-y-12">
                            <div className="text-center space-y-4 pt-8">
                                <div className="w-20 h-20 bg-[#00ff88]/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#00ff88]/10 shadow-2xl">
                                    <svg className="w-10 h-10 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V5l12-2v14l-12 2zM9 19l-6-2V3l6 2m0 14V5" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">Concept Laboratory</h3>
                                <p className="text-gray-400 max-w-sm mx-auto leading-relaxed text-sm">
                                    Map out structural hierarchies and semantic relationships within your material.
                                </p>
                            </div>

                            {isGeneratingMindmap ? (
                                <div className="w-full space-y-8 animate-pulse">
                                    <div className="h-40 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Mapping Nodes...</span>
                                    </div>
                                    <LocalizedShimmer blocks={2} />
                                </div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                                    <div className="space-y-4 text-left">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Select Target Scope</h4>
                                        <GenerationScopeSelector />
                                    </div>

                                    <button
                                        onClick={() => onGenerate('mindmap')}
                                        className="w-full py-5 bg-[#00ff88] text-black rounded-2xl text-xs font-black transition-all hover:bg-[#00dd77] active:scale-95 shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest"
                                    >
                                        Generate Mindmap
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
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
        </div>
    );
};

export default Mindmap;
