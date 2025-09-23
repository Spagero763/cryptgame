import { Address } from 'viem';
import { VersaGamesABI } from './abi';

// TODO: Replace with your deployed contract address and AI wallet address
export const contractAddress: Address = '0x3feA5C32f831c7ef4BF4eC080954dB7577030Ead'; 
export const aiWalletAddress: Address = '0xYourAIWalletAddressHere';

export const versaGamesContract = {
  address: contractAddress,
  abi: VersaGamesABI,
} as const;
