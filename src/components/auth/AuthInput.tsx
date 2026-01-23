import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, error, ...props }) => {
    return (
        <div className="w-full flex flex-col gap-1.5 mb-4 font-sans">
            <label className="text-sm font-medium text-gray-400">
                {label}
            </label>
            <input
                {...props}
                className={`w-full px-4 py-3 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'
                    } rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500/50 transition-all duration-200`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default AuthInput;
