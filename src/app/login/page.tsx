'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import SocialButton from '@/components/auth/SocialButton';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const { login, loading, loginWithGoogle, loginWithGithub } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setAuthError(err.message || 'Failed to login');
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setAuthError(null);
        try {
            if (provider === 'google') await loginWithGoogle();
            else await loginWithGithub();
            router.push('/');
        } catch (err: any) {
            setAuthError(err.message || `Failed to login with ${provider}`);
        }
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
                {authError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium mb-4 animate-in fade-in slide-in-from-top-1">
                        {authError}
                    </div>
                )}
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

                <AuthButton type="submit" isLoading={loading}>
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
                    <SocialButton provider="google" onClick={() => handleSocialLogin('google')} />
                    <SocialButton provider="github" onClick={() => handleSocialLogin('github')} />
                </div>
            </form>
        </AuthLayout>
    );
}
