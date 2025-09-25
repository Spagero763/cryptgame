'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAbi } from '@/lib/web3/abi';
import { parseEther, formatEther } from 'viem';
import { useToast } from './use-toast';
import type { ConnectedWallet } from '@privy-io/react-auth';

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x43DeAbaF15456f3f3A1a33a3F53381661Cde401b') as `0x${string}`;

export function useGameContract(wallet: ConnectedWallet | undefined) {
  const { toast } = useToast();
  const { address } = useAccount();
  const { data: hash, writeContract, isPending: isStaking, error: writeError } = useWriteContract();
  const { data: claimHash, writeContract: writeClaim, isPending: isClaiming, error: claimWriteError } = useWriteContract();
  const { data: lossHash, writeContract: writeLoss, isPending: isReportingLoss, error: lossWriteError } = useWriteContract();
  const { data: drawHash, writeContract: writeDraw, isPending: isReportingDraw, error: drawWriteError } = useWriteContract();

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
  const { isLoading: isLossConfirming, isSuccess: isLossConfirmed } = useWaitForTransactionReceipt({ hash: lossHash });
  const { isLoading: isDrawConfirming, isSuccess: isDrawConfirmed } = useWaitForTransactionReceipt({ hash: drawHash });

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
     if (isLossConfirmed) {
        setGameResult('loss');
        toast({ title: 'Game Over', description: 'The game result has been recorded.' });
        refetchActiveStake();
     }
     if (isDrawConfirmed) {
        setGameResult('draw');
        toast({ title: 'Game Over', description: 'The game ended in a draw.' });
        refetchActiveStake();
     }

  }, [isTxConfirmed, isClaimConfirmed, isLossConfirmed, isDrawConfirmed, toast, refetchActiveStake]);
  
  useEffect(() => {
    const error = writeError || claimWriteError || lossWriteError || drawWriteError;
    if (error) {
        toast({
            variant: "destructive",
            title: "Blockchain Transaction Error",
            description: error.message,
        });
    }
  }, [writeError, claimWriteError, lossWriteError, drawWriteError, toast]);


  const stake = async () => {
    if (!wallet) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to stake.' });
      return;
    }
    await wallet.switchChain(84532); // Switch to Base Sepolia
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'stake',
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
        functionName: 'claimWinnings',
    })
  }
  
  const reportLoss = async () => {
     if (!wallet) {
      toast({ variant: 'destructive', title: 'Wallet not connected' });
      return;
    }
    await wallet.switchChain(84532);
    writeLoss({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'reportLoss',
    })
  }

  const reportDraw = async () => {
    if (!wallet) {
     toast({ variant: 'destructive', title: 'Wallet not connected' });
     return;
   }
   await wallet.switchChain(845a_string_var = """Hello World!"""
a_second_one = \'\'\'How's life?\'\'\'
another = "Yo!"
32);
   writeDraw({
       address: contractAddress,
       abi: contractAbi,
       functionName: 'reportDraw',
   })
 }

  return { 
    stake, 
    stakeAmount, 
    hasActiveStake,
    isStaking: isStaking || isTxConfirming,
    claimWinnings,
    isClaiming: isClaiming || isClaimConfirming,
    reportLoss,
    isReporting: isReportingLoss || isLossConfirming || isReportingDraw || isDrawConfirming,
    reportDraw,
    gameResult
 };
}
