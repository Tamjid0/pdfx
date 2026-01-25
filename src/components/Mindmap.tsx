
import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import ReactFlow, { useNodesState, useEdgesState, MiniMap, Controls, Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';

interface MindmapNode {
    id: string;
    data: { label: string };
    position: { x: number, y: number }; // Elkjs needs position
}

interface MindmapEdge {
    id: string;
    source: string;
    target: string;
}

interface MindmapProps {
    data: {
        nodes: MindmapNode[];
        edges: MindmapEdge[];
    } | null;
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

const Mindmap: React.FC<MindmapProps> = ({ data, onGenerate }) => {
    const { isGeneratingMindmap } = useStore();
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

    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0a0a0a] rounded-xl border border-white/5">
                {isGeneratingMindmap ? (
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-12 h-12 bg-gemini-green/5 rounded-2xl flex items-center justify-center mb-4 border border-gemini-green/10">
                                <div className="w-6 h-6 border-2 border-gemini-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Architecting Mind Map...</h3>
                        </div>
                        <LocalizedShimmer blocks={3} />
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                            <svg className="w-10 h-10 text-gemini-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Conceptual Network</h3>
                        <p className="text-gemini-gray mb-8 max-w-sm leading-relaxed">
                            Visualize the structural logic and thematic connections of your document with an interactive AI-generated mind map.
                        </p>
                        <button
                            onClick={() => onGenerate('mindmap')}
                            className="group relative px-8 py-3.5 bg-gemini-green text-black rounded-xl text-sm font-black transition-all hover:bg-gemini-green-300 active:scale-95 shadow-[0_5px_15px_rgba(0,255,136,0.3)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                CONSTRUCT MAP
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <div className="absolute top-0 right-0 z-10 p-2">
                <button
                    onClick={() => onGenerate('mindmap')}
                    disabled={isGeneratingMindmap}
                    className="px-4 py-2 bg-[#00ff88] text-black border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-[#00dd77] flex items-center gap-2 disabled:opacity-50"
                >
                    {isGeneratingMindmap ? (
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                    {isGeneratingMindmap ? 'ARCHITECTING...' : 'Regenerate'}
                </button>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
};

export default Mindmap;
