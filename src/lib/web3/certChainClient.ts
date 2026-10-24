import { BrowserProvider, Contract, JsonRpcProvider, keccak256, toUtf8Bytes, type Eip1193Provider } from 'ethers';
import CertChainABI from './CertChainABI.json';
import contractDeployment from './contractDeployment.json';

// Declare Ethereum provider on window
declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
export const CONTRACT_ADDRESS = contractDeployment.contractAddress;

/**
 * Get read-only contract instance connected to Localhost RPC or Browser
 */
export function getReadOnlyContract(): Contract {
  try {
    const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
    return new Contract(CONTRACT_ADDRESS, CertChainABI, provider);
  } catch (error) {
    console.warn('Fallback: JSON-RPC Provider not ready, checking browser provider', error);
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      return new Contract(CONTRACT_ADDRESS, CertChainABI, provider);
    }
    throw new Error('No available Ethereum provider for CertChain');
  }
}

/**
 * Connect to MetaMask and get signer & contract instance
 */
export async function getSignerContract(): Promise<{
  contract: Contract;
  signerAddress: string;
  provider: BrowserProvider;
}> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to interact with the blockchain.');
  }

  const provider = new BrowserProvider(window.ethereum);

  // Request account access
  const accounts: string[] = await provider.send('eth_requestAccounts', []);
  if (!accounts || accounts.length === 0) {
    throw new Error('No Ethereum accounts authorized.');
  }

  // Ensure network is set to Localhost (Chain ID 31337)
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== HARDHAT_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 in hex
      });
    } catch (switchError: unknown) {
      // If network not found in MetaMask, add it
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7a69',
              chainName: 'Hardhat Localhost',
              rpcUrls: [HARDHAT_RPC_URL],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw new Error(`Please switch your MetaMask network to Hardhat Localhost (Chain ID ${HARDHAT_CHAIN_ID}).`);
      }
    }
  }

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = new Contract(CONTRACT_ADDRESS, CertChainABI, signer);

  return { contract, signerAddress, provider };
}

/**
 * Public Verification by Certificate ID
 */
export async function verifyCertificateOnChain(certId: string) {
  const contract = getReadOnlyContract();
  const res = await contract.verifyCertificate(certId);

  return {
    exists: Boolean(res[0]),
    isValid: Boolean(res[1]),
    sha256Hash: String(res[2]),
    issuer: String(res[3]),
    issuedAt: Number(res[4]),
    revocationReason: String(res[5]),
    revokedAt: Number(res[6]),
    revokedBy: String(res[7]),
  };
}

/**
 * Convert SHA-256 string or raw string to bytes32 format for smart contract
 */
export function formatSha256ToBytes32(hashOrData: string): string {
  if (hashOrData.startsWith('0x') && hashOrData.length === 66) {
    return hashOrData;
  }
  if (/^[0-9a-fA-F]{64}$/.test(hashOrData)) {
    return `0x${hashOrData}`;
  }
  return keccak256(toUtf8Bytes(hashOrData));
}

/**
 * Issue a Certificate on-chain (Issuer role required)
 */
export async function issueCertificateOnChain(certId: string, sha256Hex: string) {
  const { contract } = await getSignerContract();
  const formattedHash = formatSha256ToBytes32(sha256Hex);

  const tx = await contract.issueCertificate(certId, formattedHash);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Approve Revocation on-chain (Controller role required)
 */
export async function approveRevocationOnChain(certId: string, reason: string) {
  const { contract } = await getSignerContract();

  const tx = await contract.approveRevocation(certId, reason);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}
