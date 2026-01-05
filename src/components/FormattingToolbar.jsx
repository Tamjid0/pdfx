'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\FormattingToolbar.tsx";import React from 'react';













const FormattingToolbar = ({
  position,
  onBold,
  onItalic,
  onUnderline,
  onHighlight,
  isBold,
  isItalic,
  isUnderline,
  isHighlight,
}) => {
  const style = {
    position: 'absolute',
    top: position.y,
    left: position.x,
    zIndex: 1000,
    display: 'flex',
    gap: '4px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  };

  const getButtonStyle = (isActive) => ({
    backgroundColor: isActive ? '#00ff88' : '#252525',
    border: '1px solid #333',
    color: isActive ? '#000' : '#ccc',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
  });

  return (
    React.createElement('div', { style: style, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , React.createElement('button', { style: getButtonStyle(isBold), onClick: onBold, title: "Bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, "B"))
      , React.createElement('button', { style: getButtonStyle(isItalic), onClick: onItalic, title: "Italic", __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, React.createElement('i', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "I"))
      , React.createElement('button', { style: getButtonStyle(isUnderline), onClick: onUnderline, title: "Underline", __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, React.createElement('u', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "U"))
      , React.createElement('button', { style: getButtonStyle(isHighlight), onClick: onHighlight, title: "Highlight", __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}, "H")
    )
  );
};

export default FormattingToolbar;