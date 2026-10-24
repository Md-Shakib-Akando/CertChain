import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("PUB CertChain Smart Contract", function () {
  let certChain;
  let admin, controller, issuer, student, unauthorized;

  const sampleCertId = "PUB-CSE-2026-0001";
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("PUB_STUDENT_CERT_DATA_1"));

  beforeEach(async function () {
    [admin, controller, issuer, student, unauthorized] = await ethers.getSigners();

    const CertChainFactory = await ethers.getContractFactory("CertChain");
    certChain = await CertChainFactory.deploy(admin.address, controller.address);
    await certChain.waitForDeployment();

    // Admin grants ISSUER_ROLE to issuer
    await certChain.connect(admin).addIssuer(issuer.address);
  });

  describe("Deployment & Roles", function () {
    it("should set admin and controller roles correctly", async function () {
      const DEFAULT_ADMIN_ROLE = await certChain.DEFAULT_ADMIN_ROLE();
      const CONTROLLER_ROLE = await certChain.CONTROLLER_ROLE();
      const ISSUER_ROLE = await certChain.ISSUER_ROLE();

      expect(await certChain.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await certChain.hasRole(CONTROLLER_ROLE, controller.address)).to.be.true;
      expect(await certChain.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
      expect(await certChain.hasRole(ISSUER_ROLE, unauthorized.address)).to.be.false;
    });

    it("should allow admin to add and remove an issuer", async function () {
      const ISSUER_ROLE = await certChain.ISSUER_ROLE();
      await certChain.connect(admin).addIssuer(student.address);
      expect(await certChain.hasRole(ISSUER_ROLE, student.address)).to.be.true;

      await certChain.connect(admin).removeIssuer(student.address);
      expect(await certChain.hasRole(ISSUER_ROLE, student.address)).to.be.false;
    });
  });

  describe("Certificate Issuance", function () {
    it("should allow authorized issuer to issue a certificate", async function () {
      await expect(
        certChain.connect(issuer).issueCertificate(sampleCertId, sampleHash)
      )
        .to.emit(certChain, "CertificateIssued")
        .withArgs(sampleCertId, sampleHash, issuer.address, (val) => val > 0);

      const verification = await certChain.verifyCertificate(sampleCertId);
      expect(verification.exists).to.be.true;
      expect(verification.isValid).to.be.true;
      expect(verification.sha256Hash).to.equal(sampleHash);
      expect(verification.issuer).to.equal(issuer.address);
      expect(await certChain.getTotalCertificates()).to.equal(1n);
    });

    it("should prevent unauthorized address from issuing a certificate", async function () {
      await expect(
        certChain.connect(unauthorized).issueCertificate(sampleCertId, sampleHash)
      ).to.be.revertedWithCustomError(certChain, "AccessControlUnauthorizedAccount");
    });

    it("should prevent issuing with an already registered certificate ID", async function () {
      await certChain.connect(issuer).issueCertificate(sampleCertId, sampleHash);

      const differentHash = ethers.keccak256(ethers.toUtf8Bytes("ANOTHER_HASH"));
      await expect(
        certChain.connect(issuer).issueCertificate(sampleCertId, differentHash)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("should prevent issuing with an already registered certificate hash", async function () {
      await certChain.connect(issuer).issueCertificate(sampleCertId, sampleHash);

      await expect(
        certChain.connect(issuer).issueCertificate("PUB-CSE-2026-0002", sampleHash)
      ).to.be.revertedWith("Certificate hash already registered");
    });
  });

  describe("Controller Revocation Flow", function () {
    beforeEach(async function () {
      await certChain.connect(issuer).issueCertificate(sampleCertId, sampleHash);
    });

    it("should allow Controller to approve certificate revocation", async function () {
      const reason = "Administrative error in course credit calculation";

      await expect(
        certChain.connect(controller).approveRevocation(sampleCertId, reason)
      )
        .to.emit(certChain, "CertificateRevoked")
        .withArgs(sampleCertId, controller.address, reason, (val) => val > 0);

      const verification = await certChain.verifyCertificate(sampleCertId);
      expect(verification.exists).to.be.true;
      expect(verification.isValid).to.be.false;
      expect(verification.revocationReason).to.equal(reason);
      expect(verification.revokedBy).to.equal(controller.address);
      expect(verification.revokedAt).to.be.greaterThan(0n);
    });

    it("should reject revocation attempt by non-controller (even issuer)", async function () {
      await expect(
        certChain.connect(issuer).approveRevocation(sampleCertId, "Unauthorized attempt")
      ).to.be.revertedWithCustomError(certChain, "AccessControlUnauthorizedAccount");
    });

    it("should prevent revoking an already revoked certificate", async function () {
      await certChain.connect(controller).approveRevocation(sampleCertId, "Initial revocation");

      await expect(
        certChain.connect(controller).approveRevocation(sampleCertId, "Duplicate revocation")
      ).to.be.revertedWith("Certificate is already revoked");
    });
  });

  describe("Reverse Lookup by Hash", function () {
    it("should correctly verify and look up certificate by hash", async function () {
      await certChain.connect(issuer).issueCertificate(sampleCertId, sampleHash);

      const lookup = await certChain.verifyCertificateByHash(sampleHash);
      expect(lookup.exists).to.be.true;
      expect(lookup.isValid).to.be.true;
      expect(lookup.certId).to.equal(sampleCertId);
      expect(lookup.issuer).to.equal(issuer.address);
    });
  });
});
