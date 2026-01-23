import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, error, ...props }) => {
    return (
        <div className="w-full flex flex-col gap-1.5 mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <input
                {...props}
                className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'
                    } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default AuthInput;
