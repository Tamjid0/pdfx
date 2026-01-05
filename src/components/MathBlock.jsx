'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\MathBlock.tsx";import React, { useState } from 'react';
import Editor from './Editor';


const MathBlock = () => {
  const [editorState, setEditorState] = useState();

  const handleChange = (editorState) => {
    setEditorState(editorState);
  };

  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 13}}
      , React.createElement(Editor, { onChange: handleChange, __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}} )
    )
  );
};

export default MathBlock;