'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\TiptapEditor.tsx";import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import TextAlign from '@tiptap/extension-text-align';







const TiptapEditor = ({ onEditorChange, htmlContent, onEditorCreated }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: htmlContent || '',
    onUpdate: ({ editor }) => {
      onEditorChange(editor.getHTML(), editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorCreated) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

  useEffect(() => {
    if (editor && htmlContent && editor.getHTML() !== htmlContent) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}
      , React.createElement(EditorContent, { editor: editor, __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}} )
    )
  );
};

export default TiptapEditor;
