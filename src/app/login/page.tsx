'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import SocialButton from '@/components/auth/SocialButton';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Integrate Firebase Auth
        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
        }, 1000);
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your details to access your account"
            alternateAction={{
                text: "Don't have an account?",
                linkText: "Sign up",
                href: "/signup",
            }}
        >
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <AuthInput
                    label="Email address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="flex flex-col gap-1">
                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="flex justify-end mb-4">
                        <a href="#" className="text-sm font-medium text-green-600 dark:text-green-500 hover:underline">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <AuthButton type="submit" isLoading={isLoading}>
                    Sign in
                </AuthButton>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#121214] px-3 text-gray-500 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SocialButton provider="google" onClick={() => console.log('Google login')} />
                    <SocialButton provider="github" onClick={() => console.log('GitHub login')} />
                </div>
            </form>
        </AuthLayout>
    );
}
