'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { versaGamesContract } from '@/lib/web3/config';

export function useGameFee() {
  return useReadContract({
    ...versaGamesContract,
    functionName: 'gameFee',
  });
}

export function useHasPaid() {
    const { address } = useAccount();
    return useReadContract({
      ...versaGamesContract,
      functionName: 'hasPaidToPlay',
      args: [address!],
      query: {
        enabled: !!address,
      }
    });
}

export function usePayFee() {
  const { data: hash, writeContract, ...rest } = useWriteContract({
    mutation: {
        // You can add mutation options here if needed, like onSuccess, onError
    }
  });

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const write = (
    ...args: Parameters<typeof writeContract>
  ) => {
    const [vars, options] = args;
    writeContract({
        ...versaGamesContract,
        ...(vars as any),
    }, options);
  }

  return {
    write,
    hash,
    isConfirming,
    isSuccess,
    ...rest
  };
}
