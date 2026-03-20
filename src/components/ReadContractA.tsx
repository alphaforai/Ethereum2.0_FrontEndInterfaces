"use client";
import React from "react";
import { useReadContract } from "wagmi";
import { mainnet } from "wagmi/chains";
import { fixedStakingA_ContractConfig } from "@/config/fixedStakingA_ContractConfig";

const ReadContractA = () => {
  // 如果你的合约部署在 sepolia，优先用它来读。
  // 若在 mainnet 部署，把 sepolia 改成 mainnet 即可。
  const TARGET_CHAIN_ID = mainnet.id;

  const { data, error, isPending } = useReadContract({
    ...fixedStakingA_ContractConfig,
    chainId: TARGET_CHAIN_ID,
    functionName: "flexibleApy",
  });



  if (isPending) return <div>Loading...</div>;
  
  const getErrorMessage = (e: unknown) => {
    const err = e as { shortMessage?: string; message?: string };
    return err.shortMessage ?? err.message ?? String(e);
  };

  if (error) return <div>Error: {getErrorMessage(error)}</div>;
  return (
    <div>
      <div>Flexible APY: {data?.toString()}</div>
    </div>
  );
};

export default ReadContractA;
