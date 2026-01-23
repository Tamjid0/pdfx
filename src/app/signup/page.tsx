'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import SocialButton from '@/components/auth/SocialButton';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
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
            title="Create an account"
            subtitle="Join PDFy and start transforming your documents"
            alternateAction={{
                text: "Already have an account?",
                linkText: "Sign in",
                href: "/login",
            }}
        >
            <form onSubmit={handleSignup} className="flex flex-col gap-2">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By signing up, you agree to our{' '}
                        <a href="#" className="font-semibold text-gray-700 dark:text-gray-300 hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="font-semibold text-gray-700 dark:text-gray-300 hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                <AuthButton type="submit" isLoading={isLoading}>
                    Create account
                </AuthButton>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100 dark:border-zinc-900" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-950 px-3 text-gray-500 font-medium">
                            Or sign up with
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SocialButton provider="google" onClick={() => console.log('Google signup')} />
                    <SocialButton provider="github" onClick={() => console.log('GitHub signup')} />
                </div>
            </form>
        </AuthLayout>
    );
}
