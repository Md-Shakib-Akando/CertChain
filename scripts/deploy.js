import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ethers } = hre;
  const [admin, controller, defaultIssuer] = await ethers.getSigners();

  console.log("====================================================");
  console.log("🚀 Deploying PUB CertChain Smart Contract...");
  console.log("====================================================");
  console.log(`📌 Admin Address:      ${admin.address}`);
  console.log(`📌 Controller Address: ${controller.address}`);
  console.log(`📌 Default Issuer:    ${defaultIssuer.address}`);

  const CertChainFactory = await ethers.getContractFactory("CertChain");
  const certChain = await CertChainFactory.deploy(admin.address, controller.address);
  await certChain.waitForDeployment();

  const contractAddress = await certChain.getAddress();
  console.log(`\n🎉 CertChain deployed successfully to: ${contractAddress}`);

  // Authorize defaultIssuer for convenience in local testing
  const tx = await certChain.connect(admin).addIssuer(defaultIssuer.address);
  await tx.wait();
  console.log(`✅ Default Issuer (${defaultIssuer.address}) authorized on-chain!`);

  // Export contract address and ABI to src/lib/web3 for Next.js app
  const web3Dir = path.resolve(__dirname, "../src/lib/web3");
  if (!fs.existsSync(web3Dir)) {
    fs.mkdirSync(web3Dir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("CertChain");

  const deploymentData = {
    contractAddress,
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    adminAddress: admin.address,
    controllerAddress: controller.address,
    defaultIssuerAddress: defaultIssuer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(web3Dir, "contractDeployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  fs.writeFileSync(
    path.join(web3Dir, "CertChainABI.json"),
    JSON.stringify(contractArtifact.abi, null, 2)
  );

  console.log(`📁 Contract deployment info exported to: src/lib/web3/contractDeployment.json`);
  console.log(`📁 Contract ABI exported to: src/lib/web3/CertChainABI.json`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
