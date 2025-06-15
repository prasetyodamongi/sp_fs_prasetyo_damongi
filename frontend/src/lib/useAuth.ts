'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from './auth';

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);
};

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);
};