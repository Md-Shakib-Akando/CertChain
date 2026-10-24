import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import CertChainABI from './CertChainABI.json';
import contractDeployment from './contractDeployment.json';

const HARDHAT_RPC_URL = process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = contractDeployment.contractAddress;

// Default Hardhat Account #2 (Default Issuer) Private Key
// Mnemonic: "test test test test test test test test test test test junk"
const HARDHAT_ISSUER_PRIVATE_KEY =
  process.env.ISSUER_PRIVATE_KEY || '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

/**
 * Server-side helper to interact with CertChain smart contract
 */
export async function issueOnChainServer(certId: string, sha256Hex: string) {
  try {
    const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
    // Test provider connection with a short timeout
    await provider.getBlockNumber();

    const wallet = new Wallet(HARDHAT_ISSUER_PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, CertChainABI, wallet);

    const formattedHash = sha256Hex.startsWith('0x') ? sha256Hex : `0x${sha256Hex}`;
    const tx = await contract.issueCertificate(certId, formattedHash);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.warn('Notice: Blockchain RPC transaction skipped or local node not running:', (error as Error).message);
    // Deterministic fallback mock hash for local development without active chain node
    const pseudoHash = `0x${Buffer.from(certId + sha256Hex).toString('hex').slice(0, 64).padEnd(64, '0')}`;
    return {
      success: false,
      txHash: pseudoHash,
      blockNumber: 19402800 + Math.floor(Math.random() * 5000),
      fallback: true,
    };
  }
}

/**
 * Server-side helper to batch issue multiple certificates in one smart contract transaction
 */
export async function batchIssueOnChainServer(items: { certId: string; sha256Hex: string }[]) {
  if (items.length === 0) return { success: true, txHash: '0x0', blockNumber: 0 };
  try {
    const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
    await provider.getBlockNumber();

    const wallet = new Wallet(HARDHAT_ISSUER_PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, CertChainABI, wallet);

    const certIds = items.map((i) => i.certId);
    const hashes = items.map((i) => (i.sha256Hex.startsWith('0x') ? i.sha256Hex : `0x${i.sha256Hex}`));

    const tx = await contract.batchIssueCertificates(certIds, hashes);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.warn('Notice: Blockchain batch transaction skipped or local node not running:', (error as Error).message);
    const pseudoHash = `0x${Buffer.from(items[0]?.certId || 'BATCH').toString('hex').slice(0, 64).padEnd(64, '0')}`;
    return {
      success: false,
      txHash: pseudoHash,
      blockNumber: 19402800 + Math.floor(Math.random() * 5000),
      fallback: true,
    };
  }
}

/**
 * Server-side read-only verification against the smart contract
 */
export async function verifyOnChainServer(certId: string) {
  try {
    const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
    const contract = new Contract(CONTRACT_ADDRESS, CertChainABI, provider);

    const res = await contract.verifyCertificate(certId);
    return {
      onChainChecked: true,
      exists: Boolean(res[0]),
      isValid: Boolean(res[1]),
      sha256Hash: String(res[2]),
      issuer: String(res[3]),
      issuedAt: Number(res[4]),
      revocationReason: String(res[5]),
      revokedAt: Number(res[6]),
    };
  } catch {
    return {
      onChainChecked: false,
      exists: false,
      isValid: false,
      sha256Hash: '',
      issuer: '',
      issuedAt: 0,
      revocationReason: '',
      revokedAt: 0,
    };
  }
}
