'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ScanSearch, Swords, BrainCircuit, Puzzle, Crown, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const games = [
  {
    title: 'Tic Tac Toe',
    description: 'The classic game of X\'s and O\'s. Challenge a friend or our unbeatable AI.',
    href: '/tic-tac-toe',
    icon: <Swords className="h-12 w-12 text-primary" />,
  },
  {
    title: 'Scrabble',
    description: 'Put your vocabulary to the test. Play against a friend or a cunning AI.',
    href: '/scrabble',
    icon: <ScanSearch className="h-12 w-12 text-primary" />,
  },
  {
    title: 'Sliding Puzzle',
    description: 'Solve the puzzle by arranging the tiles in order. A true test of logic.',
    href: '/puzzle',
    icon: <LayoutGrid className="h-12 w-12 text-primary" />,
  },
  {
    title: 'Memory Match',
    description: 'Test your memory and concentration. Find all the matching pairs!',
    href: '/memory-game',
    icon: <BrainCircuit className="h-12 w-12 text-primary" />,
  },
  {
    title: 'Checkers',
    description: 'A classic strategy game. Can you outsmart the AI and capture all its pieces?',
    href: '/checkers',
    icon: <Puzzle className="h-12 w-12 text-primary" />,
  },
  {
    title: 'Chess',
    description: 'The ultimate game of strategy. Challenge a powerful AI opponent.',
    href: '/chess',
    icon: <Crown className="h-12 w-12 text-primary" />,
  }
];

export default function Home() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Welcome to <span className="gradient-text">VersaGames</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your one-stop destination for classic games with a modern twist. Play against our unbeatable AI or challenge your friends.
        </p>
      </header>

      {!isConnected ? (
        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-card to-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl">Connect Your Wallet to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to start playing.
              </p>
              <Button onClick={() => open()} size="lg">
                <LogIn className="mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card key={game.title} className="flex flex-col overflow-hidden rounded-xl border-2 bg-gradient-to-br from-card to-secondary/30 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
              <CardHeader className="flex flex-col items-center justify-center p-8 bg-secondary/50">
                {game.icon}
                <CardTitle className="mt-6 text-2xl font-bold text-center">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6">
                <p className="flex-1 text-muted-foreground">{game.description}</p>
                <Link href={game.href} passHref className="w-full">
                    <Button className="mt-6 w-full" size="lg">
                        Play Now
                    </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
