export function truncateMiddle(value: string, head = 10, tail = 8) {
  if (!value) return '';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Block explorer link helper; returns undefined for local/unknown networks. */
export function explorerTxUrl(txHash?: string | null, network?: string | null) {
  if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) return undefined;
  const n = (network || '').toLowerCase();
  if (n.includes('sepolia')) return `https://sepolia.etherscan.io/tx/${txHash}`;
  if (n.includes('mainnet')) return `https://etherscan.io/tx/${txHash}`;
  return undefined;
}

