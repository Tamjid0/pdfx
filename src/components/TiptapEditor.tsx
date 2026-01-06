import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import TextAlign from '@tiptap/extension-text-align';

interface TiptapEditorProps {
    onEditorChange: (html: string, text: string) => void;
    htmlContent: string | null;
    onEditorCreated?: (editor: any) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ onEditorChange, htmlContent, onEditorCreated }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: htmlContent || '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onEditorChange(editor.getHTML(), editor.getText());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[500px] text-gray-300 leading-relaxed font-sans',
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
        <div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
