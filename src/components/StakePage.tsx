"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { StakeCard } from "./StakeCard";
import { RightColumn } from "./RightColumn";
import { BottomRow } from "./BottomRow";
import { Footer } from "./Footer";

const APY_MIN = 4.4;
const APY_MAX = 5.3;

export function StakePage() {
  const [apy, setApy] = useState(4.87);

  useEffect(() => {
    const t = setInterval(() => {
      setApy((prev) => {
        const next = prev + (Math.random() - 0.5) * 0.008;
        return Math.max(APY_MIN, Math.min(APY_MAX, next));
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const apyStr = apy.toFixed(2) + "%";

  return (
    <>
      {/* Background */}
      <div className="bg-layer" />
      <div className="bg-bottom" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Header />
      <Hero liveApy={apyStr} />

      <div className="container">
        <div className="main-grid">
          <StakeCard apy={apy} apyStr={apyStr} />
          <RightColumn />
        </div>

        <BottomRow />
        <Footer />
      </div>
    </>
  );
}
