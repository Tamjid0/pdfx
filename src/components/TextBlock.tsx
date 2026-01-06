import React, { useState } from 'react';
import Editor from './Editor';
import type { EditorState } from 'lexical';

const TextBlock: React.FC = () => {
    const [editorState, setEditorState] = useState<EditorState>();

    const handleChange = (editorState: EditorState) => {
        setEditorState(editorState);
    };

    return (
        <div>
            <Editor onChange={handleChange} />
        </div>
    );
};

export default TextBlock;
