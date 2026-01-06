
import React, { useEffect } from 'react';
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


const Mindmap: React.FC<MindmapProps> = ({ data, onGenerate }) => {
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
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg text-gray-400 mb-4">Click "Generate" to create a mind map.</p>
                <button
                    onClick={() => onGenerate('mindmap')}
                    className="summary-btn px-4 py-2 bg-[#00ff88] text-black border-none rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-[#00dd77]"
                >
                    Generate Mind Map
                </button>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <div className="absolute top-0 right-0 z-10 p-2">
                <button
                    onClick={() => onGenerate('mindmap')}
                    className="px-4 py-2 bg-[#00ff88] text-black border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-[#00dd77]"
                >
                    Regenerate
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
