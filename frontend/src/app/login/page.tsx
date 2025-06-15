'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { useRedirectIfAuthenticated } from '@/lib/useAuth';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useRedirectIfAuthenticated();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ token: string }>('/auth/login', 'POST', {
        email,
        password,
      });
      saveToken(res.token);
      router.push('/dashboard');
    } catch (err) {
      alert('Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-sm border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Masuk ke Akun Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : (
              <>
                Masuk <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <Separator className="my-4" />

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Daftar di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}