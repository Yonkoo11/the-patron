import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { publicClient } from "../lib/wagmi";
import { TREASURY_ADDRESS, TREASURY_ABI } from "../lib/contract";

interface TreasuryData {
  balance: string;
  grantCount: number;
  totalDisbursed: string;
  currentRound: number;
  patronAddress: string;
  isLoading: boolean;
}

export function useTreasury(): TreasuryData {
  const [data, setData] = useState<TreasuryData>({
    balance: "0",
    grantCount: 0,
    totalDisbursed: "0",
    currentRound: 0,
    patronAddress: "",
    isLoading: true,
  });

  useEffect(() => {
    async function fetch() {
      try {
        const [balance, grantCount, totalDisbursed, currentRound, patron] = await Promise.all([
          publicClient.readContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "treasuryBalance" }),
          publicClient.readContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "grantCount" }),
          publicClient.readContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "totalDisbursed" }),
          publicClient.readContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "currentRound" }),
          publicClient.readContract({ address: TREASURY_ADDRESS, abi: TREASURY_ABI, functionName: "patron" }),
        ]);

        setData({
          balance: formatEther(balance as bigint),
          grantCount: Number(grantCount),
          totalDisbursed: formatEther(totalDisbursed as bigint),
          currentRound: Number(currentRound),
          patronAddress: patron as string,
          isLoading: false,
        });
      } catch (err) {
        console.error("Failed to fetch treasury data:", err);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
