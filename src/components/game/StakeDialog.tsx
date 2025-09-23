'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { formatEther } from 'viem';

type StakeDialogProps = {
  open: boolean;
  onStake: () => void;
  isStaking: boolean;
  stakeAmount: bigint | undefined;
};

export default function StakeDialog({ open, onStake, isStaking, stakeAmount }: StakeDialogProps) {
  const formattedStake = stakeAmount ? formatEther(stakeAmount) : '...';

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
            <div className="text-6xl">⚔️</div>
          </div>
          <AlertDialogTitle className="text-center text-3xl font-bold font-headline">Stake to Play</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            You are about to play against the AI. To start, you must stake{' '}
            <span className="font-bold text-primary">{formattedStake} BASE Sepolia ETH</span>. The AI will
            match your stake. Winner takes all!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={onStake} disabled={isStaking} size="lg" className="w-full">
            {isStaking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Staking...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Stake and Start Game
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
