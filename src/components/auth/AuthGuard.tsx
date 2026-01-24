'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingOverlay from '../LoadingOverlay';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect logic removed to allow guest access as per Freemium plan
    // Future: Specific protected routes (like settings) can still use redirects if needed

    if (loading) {
        return <LoadingOverlay message="Preparing your workspace..." />;
    }

    return <>{children}</>;
};

export default AuthGuard;
