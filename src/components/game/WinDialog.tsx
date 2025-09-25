import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

type WinDialogProps = {
  winner: string | null;
  onReset: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isClaiming?: boolean;
  isReporting?: boolean;
  gameResult?: string | null;
  opponent?: 'ai' | 'human';
};

const Confetti = () => {
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);
  
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const newPieces = Array.from({ length: 100 }).map((_, i) => {
          const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            transform: `rotate(${Math.random() * 360}deg)`,
          };
          return <div key={i} className="confetti-piece" style={style} />;
        });
        setPieces(newPieces);
      }
    }, []);
  
    return <div className="confetti-container">{pieces}</div>;
  };

export default function WinDialog({ winner, onReset, open, onOpenChange, isClaiming, isReporting, gameResult, opponent }: WinDialogProps) {
  const isPlayerWinner = winner && winner.toLowerCase() !== 'draw' && (winner === 'X' || winner === 'White' || winner === 'Red' || winner === 'You');

  const title = winner === 'draw' ? "It's a Draw!" : isPlayerWinner ? 'Congratulations!' : 'Game Over!';
  
  let description = `The game has ended in a draw. Your stake has been added to the prize pool.`;
  if (winner && winner !== 'draw') {
    const winnerName = winner === 'X' ? 'Player 1' : winner === 'O' ? 'Player 2' : winner;
    description = `${winnerName} has won the game!`;
  }
  
  const getWeb3Description = () => {
    if (isClaiming) return "Processing your winnings on the blockchain...";
    if (isReporting) return "Recording game result on the blockchain...";

    if(gameResult === 'win') return "You won! Your winnings have been sent to your wallet."
    if(gameResult === 'loss') return "You lost. Your stake has been added to the prize pool."
    if(gameResult === 'draw') return "It's a draw. Your stake has been added to the prize pool."

    if(winner === 'draw') return "It's a draw. Your stake will be added to the prize pool.";
    if (isPlayerWinner) return "You won! Claim your winnings now.";
    return "You lost. Your stake will be added to the prize pool.";
  }


  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <style>
        {`
          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }
          .confetti-piece {
            position: absolute;
            width: 8px;
            height: 16px;
            background: #f00;
            top: -20px;
            opacity: 0;
            animation: fall 5s linear infinite;
          }
          @keyframes fall {
            to {
              transform: translateY(110vh) rotate(360deg);
              opacity: 1;
            }
          }
          .dancing-character {
            font-size: 80px;
            animation: dance 1.5s infinite ease-in-out;
            transform-origin: bottom center;
          }
          @keyframes dance {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-15deg) scale(1.1); }
            75% { transform: rotate(15deg) scale(1.1); }
          }
        `}
        </style>
      <AlertDialogContent className="w-full max-w-sm text-center overflow-hidden">
        {open && isPlayerWinner && <Confetti />}
        <AlertDialogHeader className="relative z-10">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
            {winner !== 'draw' ? (
                isPlayerWinner ? <div className="dancing-character">🎉</div> : <div className="text-6xl">😢</div>
            ) : (
                <div className="text-6xl">🤝</div>
            )}
          </div>
          <AlertDialogTitle className="text-3xl font-bold font-headline">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {opponent === 'ai' ? getWeb3Description() : description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center relative z-10">
            {isClaiming || isReporting ? (
                <Button disabled className='w-full'>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </Button>
            ) : (
                <AlertDialogAction onClick={onReset} className="w-full">
                    Play Again
                </AlertDialogAction>
            )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
