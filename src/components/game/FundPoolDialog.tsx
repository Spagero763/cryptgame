'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Coins } from 'lucide-react';
import { useGameContract } from '@/hooks/useGameContract';
import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type FundPoolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FundPoolDialog({ open, onOpenChange }: FundPoolDialogProps) {
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const { fundPrizePool, isFunding } = useGameContract(embeddedWallet);
  const [amount, setAmount] = useState('0.01');

  const handleFund = async () => {
    await fundPrizePool(amount);
    if (!isFunding) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Coins className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-center text-3xl font-bold font-headline">Fund Prize Pool</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Add funds to the smart contract's prize pool so the AI can match player stakes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
            <Label htmlFor="amount" className='text-muted-foreground'>Amount in BASE</Label>
            <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 0.01"
                disabled={isFunding}
            />
        </div>
        <DialogFooter className="sm:justify-center flex-col-reverse sm:flex-col-reverse sm:space-x-0 gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isFunding}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleFund} disabled={isFunding || !amount || parseFloat(amount) <= 0} size="lg" className="w-full">
            {isFunding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-5 w-5" />
                Send Funds
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
