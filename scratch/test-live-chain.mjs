import { createRequire } from 'module';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';

const require = createRequire(import.meta.url);
const deployment = require('../src/lib/web3/contractDeployment.json');
const CertChainABI = require('../src/lib/web3/CertChainABI.json');

const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
const HARDHAT_ISSUER_PRIVATE_KEY =
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

async function main() {
  const provider = new JsonRpcProvider(HARDHAT_RPC_URL);
  const wallet = new Wallet(HARDHAT_ISSUER_PRIVATE_KEY, provider);
  const contract = new Contract(deployment.contractAddress, CertChainABI, wallet);

  console.log('1. Checking Block Number on Blockchain...');
  const blockNum = await provider.getBlockNumber();
  console.log('Current Block Number:', blockNum);

  console.log('\n2. Calling issueCertificate() on-chain...');
  const testCertId = 'PUB-DEG-2026-LIVE01';
  const testHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  const tx = await contract.issueCertificate(testCertId, testHash);
  console.log('Transaction Broadcast! Hash:', tx.hash);

  console.log('Waiting for block confirmation...');
  const receipt = await tx.wait();
  console.log('🎉 Block Confirmed! Block Number:', receipt.blockNumber, 'Gas Used:', receipt.gasUsed.toString());

  console.log('\n3. Verifying Certificate on-chain...');
  const res = await contract.verifyCertificate(testCertId);
  console.log('Exists on blockchain?:', res[0]);
  console.log('Is valid?:            ', res[1]);
  console.log('SHA-256 Hash on chain:', res[2]);
  console.log('Issuer Address:       ', res[3]);
  console.log('Issued At Timestamp:  ', new Date(Number(res[4]) * 1000).toLocaleString());

  const total = await contract.getTotalCertificates();
  console.log('\nTotal Certificates in Smart Contract:', total.toString());
}

main().catch(console.error);
