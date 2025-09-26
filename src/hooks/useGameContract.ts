'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAbi } from '@/lib/web3/abi';
import { useToast } from './use-toast';
import type { ConnectedWallet } from '@privy-io/react-auth';

const contractAddress = '0x9Ac4e9cf67378ae43CC05786CB8C4B0c87795290' as `0x${string}`;

export function useGameContract(wallet: ConnectedWallet | undefined) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { data: hash, writeContract, isPending: isStaking, error: writeError } = useWriteContract();
  const { data: claimHash, writeContract: writeClaim, isPending: isClaiming, error: claimWriteError } = useWriteContract();
  
  const [gameResult, setGameResult] = useState<string | null>(null);

  const { data: stakeAmount, refetch: refetchStakeAmount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'stakeAmount',
  });

  const { data: activeStake, refetch: refetchActiveStake } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'activeStakes',
    args: [address],
  });
  
  const hasActiveStake = activeStake ? BigInt(activeStake.toString()) > 0 : false;

  useEffect(() => {
    refetchActiveStake();
    refetchStakeAmount();
  }, [address, refetchActiveStake, refetchStakeAmount])

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash });
  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isTxConfirmed) {
      toast({ title: 'Stake successful!', description: 'Your stake has been confirmed. The game can now begin.' });
      refetchActiveStake();
    }
     if (isClaimConfirmed) {
      setGameResult('win');
      toast({ title: 'Winnings Claimed!', description: 'Your winnings have been sent to your wallet.' });
      refetchActiveStake();
    }

  }, [isTxConfirmed, isClaimConfirmed, toast, refetchActiveStake]);
  
  useEffect(() => {
    const error = writeError || claimWriteError;
    if (error) {
        toast({
            variant: "destructive",
            title: "Blockchain Transaction Error",
            description: error.message,
        });
    }
  }, [writeError, claimWriteError, toast]);


  const stake = async () => {
    if (!wallet) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to stake.' });
      return;
    }
    await wallet.switchChain(84532);
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'playGame',
      value: stakeAmount as bigint,
    });
  };

  const claimWinnings = async () => {
     if (!wallet) {
      toast({ variant: 'destructive', title: 'Wallet not connected' });
      return;
    }
    await wallet.switchChain(84532);
    writeClaim({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'claimPrize',
    })
  }

  return { 
    stake, 
    stakeAmount, 
    hasActiveStake,
    isStaking: isStaking || isTxConfirming,
    claimWinnings,
    isClaiming: isClaiming || isClaimConfirming,
    isReporting: false, // No reporting in this contract version
    gameResult
 };
}
