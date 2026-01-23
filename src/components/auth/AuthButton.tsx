import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ children, isLoading, ...props }) => {
    return (
        <button
            {...props}
            disabled={isLoading || props.disabled}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-green-600/20 active:scale-[0.98]"
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default AuthButton;
