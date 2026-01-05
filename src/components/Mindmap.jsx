'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Mindmap.tsx";import React, { useEffect } from 'react';
import ReactFlow, { useNodesState, useEdgesState, MiniMap, Controls, Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';





















const elk = new ELK();

const getLayoutedElements = (nodes, edges, options = {}) => {
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
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React-flow uses position and not x, y
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};


const Mindmap = ({ data, onGenerate }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (data && data.nodes && data.edges) {
            getLayoutedElements(data.nodes, data.edges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                const styledNodes = layoutedNodes.map((node) => ({
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

                const styledEdges = layoutedEdges.map((edge) => ({
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
            React.createElement('div', { className: "flex flex-col items-center justify-center h-full text-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
                , React.createElement('p', { className: "text-lg text-gray-400 mb-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, "Click \"Generate\" to create a mind map."      )
                , React.createElement('button', { 
                    onClick: () => onGenerate('mindmap'),
                    className: "summary-btn px-4 py-2 bg-[#00ff88] text-black border-none rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-[#00dd77]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
, "Generate Mind Map"

                )
            )
        );
    }

    return (
        React.createElement('div', { style: { height: '100%', width: '100%', position: 'relative' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}
            , React.createElement('div', { className: "absolute top-0 right-0 z-10 p-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
                , React.createElement('button', { 
                    onClick: () => onGenerate('mindmap'),
                    className: "px-4 py-2 bg-[#00ff88] text-black border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-[#00dd77]"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
, "Regenerate"

                )
            )
            , React.createElement(ReactFlow, {
                nodes: nodes,
                edges: edges,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                fitView: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}

                , React.createElement(MiniMap, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 128}} )
                , React.createElement(Controls, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 129}} )
                , React.createElement(Background, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 130}} )
            )
        )
    );
};

export default Mindmap;