import React from 'react';

interface FormattingToolbarProps {
    position: { x: number; y: number };
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
    onHighlight: () => void;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isHighlight: boolean;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
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
    const style: React.CSSProperties = {
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

    const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
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
        <div style={style}>
            <button style={getButtonStyle(isBold)} onClick={onBold} title="Bold"><b>B</b></button>
            <button style={getButtonStyle(isItalic)} onClick={onItalic} title="Italic"><i>I</i></button>
            <button style={getButtonStyle(isUnderline)} onClick={onUnderline} title="Underline"><u>U</u></button>
            <button style={getButtonStyle(isHighlight)} onClick={onHighlight} title="Highlight">H</button>
        </div>
    );
};

export default FormattingToolbar;
