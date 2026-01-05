'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Block.tsx";import React from 'react';







const Block = ({ children, isSelected, onSelect }) => {
  const handleDuplicate = () => {
    alert('Duplicate Block - Coming Soon');
  };

  const handleDelete = () => {
    alert('Delete Block - Coming Soon');
  };

  return (
    React.createElement('div', {
      className: `bg-white border-2 rounded-lg p-4 mb-4 relative cursor-move transition-all ${isSelected ? 'border-[#00ff88] shadow-md shadow-green-500/[.2]' : 'border-gray-200 hover:border-[#00ff88] hover:shadow-md hover:shadow-green-500/[.1]'}`,
      onClick: onSelect, __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}

      , React.createElement('div', { className: `absolute -top-9 right-0 gap-1 ${isSelected ? 'flex' : 'hidden'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}
        , React.createElement('button', {
          className: "bg-white border border-gray-300 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1 hover:bg-gray-50 hover:border-[#00ff88]"             ,
          onClick: handleDuplicate, __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}

          , React.createElement('svg', { viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", className: "w-3 h-3 fill-gray-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}
            , React.createElement('path', { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}})
          ), "Copy"

        )
        , React.createElement('button', {
          className: "bg-white border border-gray-300 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1 hover:bg-gray-50 hover:border-[#00ff88]"             ,
          onClick: handleDelete, __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}

          , React.createElement('svg', { viewBox: "0 0 24 24"   , xmlns: "http://www.w3.org/2000/svg", className: "w-3 h-3 fill-gray-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
            , React.createElement('path', { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}})
          ), "Delete"

        )
      )
      , children
    )
  );
};

export default Block;
