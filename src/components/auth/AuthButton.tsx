import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ children, isLoading, ...props }) => {
    return (
        <button
            {...props}
            disabled={isLoading || props.disabled}
            className="w-full py-4 px-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-green-600/50 disabled:to-green-700/50 text-black font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] active:shadow-inner"
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default AuthButton;
