'use client';

import { LogIn, LogOut, Coins, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import Logo from '../icons/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import FundPoolDialog from '../game/FundPoolDialog';
import { useState } from 'react';

export default function Header() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);

  const userInitial = user?.email?.address?.[0]?.toUpperCase() || user?.wallet?.address?.[2]?.toUpperCase() || 'U';

  return (
    <>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                       <Avatar className="h-6 w-6">
                         <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{userInitial}</AvatarFallback>
                       </Avatar>
                      <span className="hidden sm:inline-block max-w-[150px] truncate">
                        {user?.wallet?.address}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsFundDialogOpen(true)}>
                      <Coins className="mr-2 h-4 w-4" />
                      <span>Fund Prize Pool</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              ))}
          </div>
        </div>
      </header>
      {authenticated && <FundPoolDialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen} />}
    </>
  );
}
