import React from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Footer } from "./Footer";

export function PrimeShell({
  children,
  heroApy = "4.87%",
}: {
  children: React.ReactNode;
  heroApy?: string;
}) {
  return (
    <>
      {/* Background */}
      <div className="bg-layer" />
      <div className="bg-bottom" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Header />
      <Hero liveApy={heroApy} />

      <div className="container">{children}</div>

      <Footer />
    </>
  );
}

