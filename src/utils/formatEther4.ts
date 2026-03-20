const WEI_PER_ETHER = BigInt(10) ** BigInt(18);
const DISPLAY_DECIMALS = 4;
const ZERO = BigInt(0);

function absBigInt(x: bigint) {
  return x < ZERO ? -x : x;
}

/**
 * Format a wei bigint as an ETH string with exactly 4 decimals.
 * Examples:
 * - 0n -> "0.0000"
 * - 1e18n -> "1.0000"
 * - 1234500000000000000n -> "1.2345"
 */
export function formatEther4(value?: bigint | null) {
  if (value === undefined || value === null) return "--";

  const sign = value < ZERO ? "-" : "";
  const v = absBigInt(value);

  const integerPart = v / WEI_PER_ETHER;
  const frac = v % WEI_PER_ETHER;

  const fracStr = frac.toString().padStart(18, "0");
  const frac4 = fracStr.slice(0, DISPLAY_DECIMALS);

  return `${sign}${integerPart.toString()}.${frac4}`;
}

