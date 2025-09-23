'use client';

import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import Logo from '../icons/Logo';

export default function Header() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold sm:inline-block font-headline text-lg">
            VersaGames
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {ready &&
            (authenticated ? (
              <Button onClick={logout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button onClick={login}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
