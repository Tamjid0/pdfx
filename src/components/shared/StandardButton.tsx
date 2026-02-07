import React from 'react';

interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    glow?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    glow = false,
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

    const variants = {
        primary: 'bg-gemini-green text-black hover:bg-gemini-green-hover shadow-lg shadow-gemini-green/10',
        secondary: 'bg-gemini-dark-300 text-gemini-green border border-gemini-green/20 hover:bg-gemini-green/10',
        ghost: 'text-white/80 hover:text-white hover:bg-gemini-dark-300',
        outline: 'bg-transparent border border-gemini-dark-400 text-white hover:border-gemini-green/30 hover:bg-gemini-green/5',
        danger: 'bg-transparent text-gemini-gray hover:text-red-500 hover:bg-red-500/5',
    };

    const sizes = {
        xs: 'px-2.5 py-1 text-[9px] rounded-md',
        sm: 'px-4 py-2 text-[10px] rounded-lg',
        md: 'px-6 py-2.5 text-xs rounded-xl',
        lg: 'px-8 py-3.5 text-sm rounded-2xl',
        xl: 'px-10 py-4 text-base rounded-[2rem]',
    };

    const glowStyles = glow ? 'shadow-[0_0_20px_var(--color-gemini-green-glow)]' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : icon ? (
                <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
