'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import SocialButton from '@/components/auth/SocialButton';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const { signup, loading, loginWithGoogle, loginWithGithub } = useAuth();
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        try {
            await signup(email, password);
            // Optional: Save fullName to user profile here if needed
            router.push('/');
        } catch (err: any) {
            setAuthError(err.message || 'Failed to create account');
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setAuthError(null);
        try {
            if (provider === 'google') await loginWithGoogle();
            else await loginWithGithub();
            router.push('/');
        } catch (err: any) {
            setAuthError(err.message || `Failed to sign up with ${provider}`);
        }
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Join PDFy and start transforming your documents"
            alternateAction={{
                text: "Already have an account?",
                linkText: "Sign in",
                href: "/login",
            }}
        >
            <form onSubmit={handleSignup} className="flex flex-col gap-2">
                {authError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium mb-4 animate-in fade-in slide-in-from-top-1">
                        {authError}
                    </div>
                )}
                <AuthInput
                    label="Full name"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <AuthInput
                    label="Email address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <AuthInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="mb-4">
                    <p className="text-xs text-gray-400">
                        By signing up, you agree to our{' '}
                        <a href="#" className="font-semibold text-white hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="font-semibold text-white hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                <AuthButton type="submit" isLoading={loading}>
                    Create account
                </AuthButton>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#121214] px-3 text-gray-500 font-medium">
                            Or sign up with
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
