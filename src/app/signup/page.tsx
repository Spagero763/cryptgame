'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
       <Card className="max-w-md mx-auto bg-gradient-to-br from-card to-secondary/30">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account to Play</CardTitle>
          <CardDescription>
            Sign up with your email or connect a wallet to start playing all the games.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} size="lg" className="w-full">
            <LogIn className="mr-2" />
            Sign Up / Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
