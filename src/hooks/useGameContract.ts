'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAbi } from '@/lib/web3/abi';
import { useToast } from './use-toast';
import { parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const contractAddress = '0x9Ac4e9cf67378ae43CC05786CB8C4B0c87795290' as `0x${string}`;

export function useGameContract() {
  const { toast } = useToast();
  const { address, chain } = useAccount();
  const { data: hash, writeContract, isPending: isStaking, error: writeError } = useWriteContract();
  const { data: claimHash, writeContract: writeClaim, isPending: isClaiming, error: claimWriteError } = useWriteContract();
  const { data: fundHash, writeContract: writeFund, isPending: isFunding, error: fundWriteError } = useWriteContract();
  
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
  const { isLoading: isFundConfirming, isSuccess: isFundConfirmed } = useWaitForTransactionReceipt({ hash: fundHash });

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
    if (isFundConfirmed) {
        toast({ title: 'Prize Pool Funded!', description: 'Thank you for funding the prize pool.'});
    }

  }, [isTxConfirmed, isClaimConfirmed, isFundConfirmed, toast, refetchActiveStake]);
  
  useEffect(() => {
    const error = writeError || claimWriteError || fundWriteError;
    if (error) {
        toast({
            variant: "destructive",
            title: "Blockchain Transaction Error",
            description: error.message,
        });
    }
  }, [writeError, claimWriteError, fundWriteError, toast]);


  const stake = async () => {
    if (!address) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to stake.' });
      return;
    }
    if (chain?.id !== baseSepolia.id) {
        toast({ variant: 'destructive', title: 'Wrong Network', description: `Please switch to Base Sepolia.` });
        return;
    }
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'playGame',
      value: stakeAmount as bigint,
    });
  };

  const claimWinnings = async () => {
     if (!address) {
      toast({ variant: 'destructive', title: 'Wallet not connected' });
      return;
    }
     if (chain?.id !== baseSepolia.id) {
        toast({ variant: 'destructive', title: 'Wrong Network', description: `Please switch to Base Sepolia.` });
        return;
    }
    writeClaim({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'claimPrize',
    })
  }

  const fundPrizePool = async (amount: string) => {
    if (!address) {
      toast({ variant: 'destructive', title: 'Wallet not connected' });
      return;
    }
    if (chain?.id !== baseSepolia.id) {
        toast({ variant: 'destructive', title: 'Wrong Network', description: `Please switch to Base Sepolia.` });
        return;
    }
    writeFund({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'fundPrizePool',
        value: parseEther(amount),
    })
  }

  return { 
    stake, 
    stakeAmount, 
    hasActiveStake,
    isStaking: isStaking || isTxConfirming,
    claimWinnings,
    isClaiming: isClaiming || isClaimConfirming,
    fundPrizePool,
    isFunding: isFunding || isFundConfirming,
    isReporting: false, // No reporting in this contract version
    gameResult
 };
}
