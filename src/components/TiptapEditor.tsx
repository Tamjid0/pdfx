import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import TextAlign from '@tiptap/extension-text-align';

interface TiptapEditorProps {
    onEditorChange: (html: string, text: string) => void;
    htmlContent: string | null;
    onEditorCreated?: (editor: any) => void;
    minHeight?: string;
    tightMargins?: boolean;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
    onEditorChange,
    htmlContent,
    onEditorCreated,
    minHeight = 'min-h-[500px]',
    tightMargins = false
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: htmlContent || '',
        immediatelyRender: false,
        autofocus: 'start',
        onUpdate: ({ editor }) => {
            onEditorChange(editor.getHTML(), editor.getText());
        },
        editorProps: {
            attributes: {
                class: `prose prose-invert prose-emerald max-w-none focus:outline-none ${minHeight} ${tightMargins ? '[&_p]:my-0 [&_h1]:mt-0 [&_h2]:mt-0 [&_h3]:mt-0' : ''} text-gray-300 leading-relaxed font-sans caret-[#00ff88]`,
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

    return <EditorContent editor={editor} />;
};

export default TiptapEditor;
