import { useState, useEffect } from "react";
import { publicClient } from "../lib/wagmi";
import { TREASURY_ADDRESS, TREASURY_ABI } from "../lib/contract";

export interface Grant {
  id: number;
  recipient: string;
  amount: bigint;
  reasonHash: string;
  timestamp: bigint;
  roundId: bigint;
}

export function useGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const grantCount = await publicClient.readContract({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "grantCount",
        });

        const c = Number(grantCount);
        setCount(c);

        if (c === 0) {
          setGrants([]);
          setIsLoading(false);
          return;
        }

        const results: Grant[] = [];
        for (let i = 1; i <= c; i++) {
          const result = await publicClient.readContract({
            address: TREASURY_ADDRESS,
            abi: TREASURY_ABI,
            functionName: "getGrant",
            args: [BigInt(i)],
          });

          const g = result as {
            recipient: string;
            amount: bigint;
            reasonHash: string;
            timestamp: bigint;
            roundId: bigint;
          };
          results.push({
            id: i,
            recipient: g.recipient,
            amount: g.amount,
            reasonHash: g.reasonHash,
            timestamp: g.timestamp,
            roundId: g.roundId,
          });
        }

        setGrants(results);
      } catch (err) {
        console.error("Failed to fetch grants:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { grants, count, isLoading };
}
