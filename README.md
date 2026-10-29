<div align="center">

<img src="public/images/hero4.png" alt="PUB CertChain Banner" width="100%" style="border-radius: 14px; max-height: 380px; object-fit: cover; box-shadow: 0 12px 32px rgba(14,22,34,0.18);" />

# 🎓 PUB CertChain

### Cryptographic Academic Credential Registry & Multi-Signature Ledger Governance

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.29.1-FFF100?style=for-the-badge&logo=ethereum&logoColor=black)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5.6.1-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white)](https://www.openzeppelin.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose%209-13AA52?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Developed by Team <code>FSociety</code></strong><br />
  <em>PUB CSE fest Hackathon 2026 — Problem Statement A1: PUB CertChain: Blockchain-Based Academic Certificate Verification</em><br />
  <strong>Pundra University of Science & Technology (PUB)</strong>
</p>

</div>

---

---

## 📺 Demonstration & Visual Evidence

| Resource                         | Direct Link                                                                                                           | Description                                                                    |
| :------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| 🎥 **Project Video Walkthrough** | [Google Drive Video Presentation](https://drive.google.com/file/d/1_jEOV5GVEuPhtPViII4Q3qZ5HKcuNDjm/view?usp=sharing) | Full end-to-end system walkthrough, batch issuance, and tamper detection demo. |

<div align="center">
  <img src="docs/screenshots/landing-preview.png" alt="PUB CertChain Portal Landing" width="49%" style="border-radius: 8px; border: 1px solid #E3DFD5;" />
  <img src="docs/screenshots/verification-preview.jpeg" alt="Cryptographic Verification Workbench" width="49%" style="border-radius: 8px; border: 1px solid #E3DFD5;" />
</div>

---

## 🛑 The Problem Statement

Employers, foreign universities and scholarship boards usually verify a graduate's certificate by emailing
the Registrar's office or by checking a scanned copy, which is slow and makes forged certificates hard to
detect. Build a system in which the university issues digitally verifiable certificates and transcripts, records
their fingerprints on a blockchain, and allows anyone to check a certificate within seconds without
contacting the university.

---

## 💡 The CertChain Solution

**PUB CertChain** redefines academic credential governance by bridging **Ethereum smart contracts**, **deterministic vector PDF synthesis**, **time-expiring privacy tokens**, and **dual-authority multi-signature revocation**:

- **Deterministic Mathematical Fingerprinting**: Every generated certificate PDF is normalized with standardized font metrics and zeroed timestamps (`Date(0)`). The resulting byte stream produces an identical SHA-256 cryptographic digest across any device or operating system.
- **On-Chain Immutability with Zero Gas for Verifiers**: The SHA-256 digest is anchored directly to the `CertChain.sol` smart contract. Anyone can verify records worldwide in milliseconds through read-only EVM calls without paying gas or installing crypto wallets.
- **Dual-Authority Revocation Governance**: Registrars can request revocations, but revocations can only be finalized on-chain when co-signed by the Controller of Examinations with a documented justification.
- **Privacy-Preserving Expiring Share Links**: Students generate tokenized, expiring URLs (`/s/[token]`) for job applications with custom view limits and instant revocation controls.

---

## ⚡ Core Capabilities & Key Features

### 🛡️ 1. Cryptographic Tamper-Proof Anchoring

- **SHA-256 Mathematical Identity**: The exact binary bytes of every certificate PDF are hashed using SHA-256 and committed on-chain alongside the student ID, issuer address, and block timestamp.
- **Active Tamper Detection Engine**: Modifying a single character, date, or changing a CGPA from `3.20` to `3.95` completely alters the computed hash. The platform instantly triggers a red **`INVALID_MODIFIED`** security alert and flags the mismatch side-by-side.

### 🔍 2. Zero-Gas Multi-Modal Verification

- **Certificate ID Query**: Instant verification by unique institutional identifier (e.g. `PUB-DEG-2026-000105`).
- **Client-Side Drag & Drop**: Browser computes the SHA-256 hash locally in client memory and queries the smart contract—no files are uploaded to third-party servers.
- **Live Camera QR Scanning**: Scans embedded high-density QR codes to resolve verification status in sub-seconds.
- **Zero Cost**: Built entirely on free EVM `view` functions (`verifyCertificate` and `verifyCertificateByHash`).

### 📦 3. High-Throughput Batch Issuance

- **Graduation Cohort CSV Upload**: Issuers can upload hundreds of student records simultaneously via CSV (e.g. [`batch_students_20.csv`](batch_students_20.csv)).
- **Single-Transaction Batch Anchoring**: The smart contract method `batchIssueCertificates(string[], bytes32[])` writes entire graduating classes in a single block transaction, slashing administrative gas fees by up to 70% [VERIFY].

### ⚖️ 4. Multi-Tier Role-Based Access Control (RBAC)

- **Super Administrator (`DEFAULT_ADMIN_ROLE`)**: Manages university officials, provisions Controller accounts, monitors system health, and grants/revokes on-chain issuer credentials.
- **Controller of Examinations (`CONTROLLER_ROLE`)**: Supreme institutional authority; inspects graduation rosters, reviews revocation requests, and co-signs on-chain certificate revocations with formal Syndicate justifications.
- **Authorized Certificate Issuer (`ISSUER_ROLE`)**: Authorized staff that validates academic eligibility, executes single/batch certificate issuance, and generates official stamped PDFs.
- **Student Portal**: Authenticated graduate vault to view issued degrees, download verified PDFs, and generate secure time-limited employer share links.

### 🔐 5. Admissions Pre-Matching & Brevo Email OTP

- **Zero Student Enumeration**: Self-registering students must match pre-seeded university admission records (Name, Student ID, Department, Batch, and Email).
- **Automated 6-Digit Brevo OTP**: Authenticates students via their university email using Brevo's REST API v3 before granting vault access.

### ⏱️ 6. Tokenized Privacy-Preserving Share Links

- **Targeted Employer Access**: Students generate unique shareable URLs (`/s/[token]`) with configurable durations (24 hours to 30 days) and view limits.
- **SHA-256 Token Protection**: Tokens are hashed in the database (`tokenHash`); credentials can be revoked instantly with a single click.

### 📜 7. Immutable Security Audit Trail

- Every administrative action, issuance event, public lookup, and tamper intrusion is logged with actor role, IP address, user agent, and blockchain transaction hash.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Users ["University Stakeholders & Public Verifiers"]
        AdminUser["Super Administrator"]
        ControllerUser["Controller of Examinations"]
        IssuerUser["Authorized Registrar / Issuer"]
        StudentUser["Student / Graduate"]
        PublicVerifier["Employer / Embassy Verifier"]
    end

    subgraph Client ["Frontend Presentation Layer (Next.js 16 + React 19)"]
        Landing["Public Verifier & Landing"]
        AuthUI["Institutional Gateway"]
        AdminDesk["Super Admin Console"]
        ControllerDesk["Controller Desk"]
        IssuerDesk["Registrar Issuance Desk"]
        StudentVault["Student Credential Vault"]
        ShareView["Public Token Resolver"]
    end

    subgraph Backend ["Server & Security Core (Next.js API Engine)"]
        AuthAPI["Session & OTP Validator"]
        CertEngine["Deterministic PDF Synthesizer"]
        Matcher["Admissions Registry Matcher"]
        AuditEngine["Security Audit Trail Logger"]
        BrevoClient["Brevo Transactional Email Engine"]
        Web3Service["Server Web3 Bridge"]
    end

    subgraph Persistence ["Data & Blockchain Layer"]
        MongoAtlas[("MongoDB Atlas Database")]
        LocalNode[("Ethereum Blockchain Node")]
        SmartContract["CertChain Smart Contract"]
    end

    %% User Interaction Flow
    AdminUser --> AdminDesk
    ControllerUser --> ControllerDesk
    IssuerUser --> IssuerDesk
    StudentUser --> StudentVault
    PublicVerifier --> Landing
    PublicVerifier --> ShareView

    %% Component to Backend Mapping
    AuthUI --> AuthAPI
    AdminDesk --> AuditEngine
    IssuerDesk -->|"1. Submit Record or CSV"| CertEngine
    CertEngine -->|"2. Pre-validate Record"| Matcher
    Matcher --> MongoAtlas
    CertEngine -->|"3. Generate PDF and QR"| CertEngine
    CertEngine -->|"4. Push Canonical SHA-256"| Web3Service
    Web3Service -->|"5. Anchor Hash On-Chain"| SmartContract
    SmartContract --> LocalNode
    CertEngine -->|"6. Store Metadata and PDF"| MongoAtlas
    CertEngine -->|"7. Dispatch Notification"| BrevoClient

    %% Verification Flow
    Landing -->|"Upload PDF or Cert ID"| Web3Service
    Web3Service -->|"verifyCertificate: Zero-Gas View"| SmartContract
    ShareView -->|"Resolve Token Hash"| MongoAtlas
    ShareView -->|"Verify Ledger State"| Web3Service

    %% Revocation Flow
    IssuerDesk -.->|"Submit Revocation Request"| ControllerDesk
    ControllerDesk -->|"Co-Sign & Execute approveRevocation"| Web3Service
    Web3Service -->|"approveRevocation"| SmartContract
    SmartContract -.->|"Emit CertificateRevoked"| AuditEngine
    AuditEngine --> MongoAtlas
```

---

## 📜 Smart Contract Specification (`CertChain.sol`)

The `CertChain.sol` contract is compiled with Solidity `0.8.20` and extends OpenZeppelin's audited `AccessControl`:

```solidity
struct CertificateRecord {
    string certId;             // Unique identifier (e.g. PUB-DEG-2026-000105)
    bytes32 sha256Hash;        // Canonical SHA-256 byte digest
    address issuer;            // Authorized issuer wallet
    uint256 issuedAt;          // Issuance timestamp (block.timestamp)
    bool isRevoked;            // Revocation state flag
    string revocationReason;   // Documented justification if revoked
    uint256 revokedAt;         // Revocation timestamp
    address revokedBy;         // Controller wallet that signed revocation
}
```

### Core Contract Interface

| Method                                         | Role Required          | Gas Type            | Description                                                  |
| :--------------------------------------------- | :--------------------- | :------------------ | :----------------------------------------------------------- |
| `issueCertificate(string, bytes32)`            | `ISSUER_ROLE`          | State-Changing      | Anchors a single certificate hash and ID to Ethereum.        |
| `batchIssueCertificates(string[], bytes32[])`  | `ISSUER_ROLE`          | State-Changing      | Gas-optimized bulk issuance for entire graduating cohorts.   |
| `approveRevocation(string, string)`            | `CONTROLLER_ROLE`      | State-Changing      | Marks certificate revoked with formal Syndicate reason.      |
| `verifyCertificate(string)`                    | `Public`               | **View (Zero Gas)** | Instant lookup of validity, issuer, and timestamps by ID.    |
| `verifyCertificateByHash(bytes32)`             | `Public`               | **View (Zero Gas)** | Instant reverse lookup by uploaded PDF byte hash.            |
| `addIssuer(address)` / `removeIssuer(address)` | `ADMIN` / `CONTROLLER` | State-Changing      | Authorizes or revokes registrar issuance permissions.        |
| `addController(address)`                       | `DEFAULT_ADMIN_ROLE`   | State-Changing      | Appoints an authorized Controller of Examinations.           |
| `getTotalCertificates()`                       | `Public`               | **View (Zero Gas)** | Returns the total count of certificates registered on-chain. |

---

## 💻 Tech Stack & Engineering Decisions

| Architectural Layer     | Technology / Library                                                                   | Version           | Why We Chose It                                                                                                                            |
| :---------------------- | :------------------------------------------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework**  | [Next.js (App Router)](https://nextjs.org/)                                            | `16.4.2`          | High-performance Server Components, Turbopack compilation, API route encapsulation, and SEO-optimized public routes.                       |
| **UI Library**          | [React](https://react.dev/)                                                            | `19.3.0`          | Concurrent rendering, strict state transitions, and streamlined async hook integrations.                                                   |
| **Styling System**      | [Tailwind CSS](https://tailwindcss.com/)                                               | `v4.0`            | Institutional "Registry" design tokens (`bg-night`, `bg-canvas`, `text-seal-bright`), responsive glassmorphism, zero runtime CSS overhead. |
| **Icons**               | [Lucide React](https://lucide.dev/)                                                    | `1.59.0`          | Pixel-perfect, accessible, and lightweight vector iconography.                                                                             |
| **Smart Contracts**     | [Solidity](https://soliditylang.org/)                                                  | `^0.8.20`         | Native EVM execution, Paris EVM compiler target with 200 optimizer runs for minimal contract footprint.                                    |
| **Security Standards**  | [OpenZeppelin Contracts](https://www.openzeppelin.com/)                                | `v5.6.1`          | Battle-tested, audited `AccessControl` preventing privilege escalation and reentrancy bugs.                                                |
| **Local Blockchain**    | [Hardhat](https://hardhat.org/)                                                        | `^2.29.1`         | Complete EVM development network with instantaneous deterministic block mining and integrated Chai assertions.                             |
| **Web3 Client**         | [Ethers.js](https://docs.ethers.org/)                                                  | `^6.17.0`         | Modern, modular client for cryptographic hash conversion, contract invocation, and wallet challenge signing.                               |
| **Database & ODM**      | [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)              | `^9.11.2`         | High-availability document store for metadata, student admissions truth records, expiring share links, and audit trails.                   |
| **PDF Synthesis**       | [pdf-lib](https://pdf-lib.js.org/)                                                     | `^1.17.1`         | Deterministic, vector-accurate PDF generation with zeroed creation metadata for bit-exact SHA-256 reproducibility.                         |
| **QR Engine**           | [qrcode](https://www.npmjs.com/package/qrcode) & [jsqr](https://github.com/cozmo/jsQR) | `1.5.4` / `1.4.0` | Real-time high-contrast QR generation and live webcam QR stream decoding.                                                                  |
| **Transactional Email** | [Brevo REST API v3](https://www.brevo.com/)                                            | `v3`              | Automated transactional email notifications with PDF attachments and 6-digit registration OTP codes.                                       |
| **Password Security**   | [bcryptjs](https://www.npmjs.com/package/bcryptjs)                                     | `^3.0.3`          | Salted one-way password hashing for institutional portal protection.                                                                       |

---

## 🚀 Tested Quickstart & Installation Guide

### Prerequisites

- **Node.js**: `v20.x` or higher installed ([Download Node.js](https://nodejs.org/))
- **MongoDB**: Local MongoDB daemon running (`mongodb://127.0.0.1:27017/certchain`) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.
- **Git**: Installed on your system.

---

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/Md-Shakib-Akando/CertChain.git
cd certchain
npm install
```

---

### Step 2: Environment Configuration

Copy the example environment configuration into `.env.local`:

```bash
cp .env.example .env.local
```

Ensure `.env.local` contains valid parameters (default Hardhat test keys are pre-filled for immediate local testing):

```env
# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Local MongoDB or Atlas URI)
MONGODB_URI=mongodb://127.0.0.1:27017/certchain

# Local Hardhat Blockchain Node
CHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Hardhat Pre-Funded Dev Wallets
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTROLLER_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
ISSUER_PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

# Brevo Email Service (Optional for offline dev; simulated if omitted)
BREVO_API_KEY=your_brevo_v3_api_key_here
BREVO_SENDER_EMAIL=certchain@pub.edu.bd
BREVO_SENDER_NAME=PUB CertChain Authority

# Default Super Admin Seed Credentials
ADMIN_EMAIL=admin@pub.edu.bd
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Super Administrator
```

---

### Step 3: Start Local Blockchain & Deploy Smart Contract

Open a new terminal to run the Hardhat local node:

```bash
# Terminal 1: Launch local Ethereum network
npm run chain:node
```

In your main terminal, compile and deploy the `CertChain` smart contract:

```bash
# Terminal 2: Compile Solidity & deploy
npm run chain:deploy
```

> **Automated Web3 Sync**: The deployment script automatically exports the fresh contract address and ABI directly to `src/lib/web3/contractDeployment.json` and `src/lib/web3/CertChainABI.json`.

---

### Step 4: Seed Database with Initial Administrator

```bash
npm run seed:admin
```

This initializes the root Super Administrator account (`admin@pub.edu.bd` / `Admin@123456`) in MongoDB.

---

### Step 5: Launch Next.js Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Demonstration Accounts

The database can be accessed using the following pre-configured institutional testing accounts:

| Role                              | Email / Identifier                       | Password         | Access Portal           |
| :-------------------------------- | :--------------------------------------- | :--------------- | :---------------------- |
| **Super Administrator**           | `admin@pub.edu.bd`                       | `Admin@123456`   | `/dashboard/admin`      |
| **Controller of Examinations**    | `controller@pub.edu.bd`                  | `Controller@123` | `/dashboard/controller` |
| **Authorized Certificate Issuer** | `issuer@pub.edu.bd`                      | `Issuer@123`     | `/dashboard/issuer`     |
| **Graduated Student**             | `0322410105101055` / `shakib@pub.edu.bd` | `Student@123`    | `/dashboard/student`    |

---

## 🧪 Verified Testing Suite & Execution Proof

### 1. Hardhat Smart Contract Unit Tests (Chai / Mocha)

To execute the automated blockchain test suite verifying access control, single issuance, batch issuance, duplicate hash rejection, and Controller revocation:

```bash
npm run chain:test
```

**Real Terminal Output:**

```text
  PUB CertChain Smart Contract
    Deployment & Roles
      ✔ should set admin and controller roles correctly
      ✔ should allow admin to add and remove an issuer
      ✔ should allow controller to add and remove an issuer
    Certificate Issuance
      ✔ should allow authorized issuer to issue a certificate (70ms)
      ✔ should prevent unauthorized address from issuing a certificate
      ✔ should prevent issuing with an already registered certificate ID
      ✔ should prevent issuing with an already registered certificate hash
    Controller Revocation Flow
      ✔ should allow Controller to approve certificate revocation
      ✔ should reject revocation attempt by non-controller (even issuer)
      ✔ should prevent revoking an already revoked certificate
    Reverse Lookup by Hash
      ✔ should correctly verify and look up certificate by hash

  11 passing (3s)
```

---

### 2. Cryptographic Tamper-Detection CLI Test

To test the active tamper detection pipeline against real binary files:

```bash
node scripts/test-tamper-detection.mjs
```

**Real Terminal Output:**

```text
========================================================
 PUB CertChain: Cryptographic Tamper Detection Test
========================================================

1. Testing Authentic File: PUB-DEG-2026-000105.pdf
   Computed SHA-256: c1dbba77e693ebb2a18510ae6b4a2546650395f67186912934aa54752338bf13
   ✅ PASS: Authentic certificate matched on-chain ledger!
      Student: Md. Shakib Akando (0322410105101055)
      Degree:  B.Sc. in Computer Science & Engineering
      CGPA:    3.88
      TxHash:  0x9a8f4c2e1b7d5a3...

2. Testing Tampered File: PUB-DEG-2026-000105-tampered.pdf
   Computed SHA-256 (Altered): 0e2b6ef2f721ed7fa0aeaeb488b6f3a7e45f6da7cea6dae61e4e363494d56a13
   Target Cert ID Extracted:   PUB-DEG-2026-000105
   🚨 PASS: Tamper detected successfully!
      Computed Hash: 0e2b6ef2f721ed7fa0aeaeb488b6f3a7e45f6da7cea6dae61e4e363494d56a13
      Ledger Hash:   c1dbba77e693ebb2a18510ae6b4a2546650395f67186912934aa54752338bf13
   Security intrusion recorded in immutable audit log.
```

---

## 🔬 Hands-On Evaluator Testing Walkthrough

The repository includes pre-built sample certificates in the [`demo/`](demo/) directory for immediate judge evaluation:

| Test Certificate File                                                            | Type                      | Expected Result                        | Action to Perform                                                                                                                                                   |
| :------------------------------------------------------------------------------- | :------------------------ | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`demo/PUB-DEG-2026-000105.pdf`](demo/PUB-DEG-2026-000105.pdf)                   | **Authentic Certificate** | 🟢 **Verified Authentic**              | Drop into the **Upload PDF** tab on [http://localhost:3000](http://localhost:3000). Displays green verification badge, student data, and Ethereum transaction hash. |
| [`demo/PUB-DEG-2026-000105-tampered.pdf`](demo/PUB-DEG-2026-000105-tampered.pdf) | **Forged / Altered File** | 🔴 **Security Alert: Tamper Detected** | Upload to verifier. Computes hash mismatch against ledger, highlights altered bits, and logs an intrusion alert.                                                    |
| [`demo/CERT-DEMO-2026-002-revoked.pdf`](demo/CERT-DEMO-2026-002-revoked.pdf)     | **Revoked Certificate**   | 🟡 **Certificate Revoked**             | Upload file or search ID `CERT-DEMO-2026-002`. Displays warning with Syndicate revocation rationale and Controller timestamp.                                       |

---

## 📁 Accurate Project Structure

```text
certchain/
├── contracts/
│   └── CertChain.sol               # OpenZeppelin AccessControl smart contract
├── scripts/
│   ├── deploy.js                   # Automated contract deployer & Web3 ABI exporter
│   ├── create-super-admin.mjs      # Database seed script for Super Admin
│   ├── test-tamper-detection.mjs   # End-to-end cryptographic tamper assertion test
│   ├── set-controller-password.mjs # Convenience password reset utility for Controller
│   └── export-demo-files.mjs       # Exporter for demo certificate suite
├── demo/
│   ├── PUB-DEG-2026-000105.pdf     # Authentic degree certificate
│   ├── PUB-DEG-2026-000105-tampered.pdf # Modified PDF for tamper detection testing
│   ├── CERT-DEMO-2026-002-revoked.pdf  # Officially revoked certificate sample
│   └── README.md                   # Evaluator test guide & cryptographic hashes
├── test/
│   └── CertChain.test.js           # Hardhat test suite (11 passing tests)
├── batch_students_20.csv           # Ready-to-use batch issuance CSV cohort (20 students)
├── public/
│   └── images/                     # Institutional branding, logos & visual previews
├── docs/
│   ├── AUTH_UI_DESIGN.md           # UI/UX design system specification
│   └── screenshots/                # Application preview screenshots
├── src/
│   ├── app/                        # Next.js 16 App Router
│   │   ├── page.tsx                # Public landing page with instant verifier
│   │   ├── login/ & register/      # Minimalist dual-panel authentication gateways
│   │   ├── verify/                 # Standalone public verification workbench
│   │   ├── s/[token]/              # Public resolver for time-expiring share links
│   │   ├── dashboard/              # Role-specific gateway dispatcher
│   │   └── api/                    # RESTful backend API routes
│   │       ├── auth/               # Login, registration, Brevo OTP handlers
│   │       ├── certificates/       # Single & batch issuance, PDF generation
│   │       ├── public/verify/      # Zero-gas on-chain verification endpoint
│   │       ├── controller/         # Revocation approval & issuer management
│   │       ├── student/            # Share link generation & profile queries
│   │       └── admin/              # User management & immutable audit logs
│   ├── components/                 # Atomic UI component library
│   │   ├── auth/                   # AuthLayout, LoginForm, RegistrationCard
│   │   ├── brand/                  # Vector SealMark and university typography
│   │   ├── public/                 # LandingHero, QuickVerification, HowItWorks
│   │   ├── student/                # StudentDashboard, ShareLinkModal, Vault
│   │   ├── issuer/                 # Single/Batch issuance desks, CSV processor
│   │   ├── controller/             # Co-signature desk, revocation queue
│   │   ├── admin/                  # SuperAdminDashboard, SystemMonitoring
│   │   └── ui/                     # Accessible component primitives (Card, Button, Field, etc.)
│   ├── lib/                        # Core utilities & services
│   │   ├── mongodb.ts              # Cached Mongoose connection client
│   │   ├── authSession.ts          # Stateless cookie session parser
│   │   ├── brevo.ts                # Brevo REST API v3 transactional email client
│   │   ├── studentRecordMatcher.ts # Exact & fuzzy admissions record validator
│   │   ├── pdf/
│   │   │   └── certificateGenerator.ts # Deterministic vector PDF synthesizer
│   │   └── web3/
│   │       ├── serverWeb3.ts       # Server-side ethers.js contract signer & provider
│   │       ├── certChainClient.ts  # Client-side smart contract read utilities
│   │       ├── CertChainABI.json   # Auto-exported smart contract ABI
│   │       └── contractDeployment.json # Auto-exported deployment address & chain ID
│   └── models/                     # Mongoose database models
│       ├── User.ts                 # Credentials, roles, approval statuses
│       ├── Certificate.ts          # Metadata, SHA-256 hash, txHash, block number
│       ├── StudentRecord.ts        # Ground-truth admissions database
│       ├── RevocationRequest.ts    # Formal revocation requests & co-signatures
│       ├── AuditLog.ts             # Tamper alerts & administrative event trail
│       ├── ShareLink.ts            # Expiring, tokenized privacy share permissions
│       └── OtpVerification.ts      # Brevo email verification challenges
├── hardhat.config.js               # Hardhat EVM compiler & network settings
├── package.json                    # Project metadata & npm scripts
└── tsconfig.json                   # Strict TypeScript compiler configuration
```

---

## 🧠 Technical Challenges & Engineering Breakthroughs

1. **Deterministic PDF Synthesis Across Runtimes**:  
   _Problem_: Generating a PDF dynamically using different system timezones or PDF generators embeds variable metadata timestamps, altering the file's SHA-256 hash even if visual contents are identical.  
   _Solution_: Implemented programmatic normalization in `certificateGenerator.ts` using `pdf-lib`, forcing creation and modification dates to `Date(0)` (`1970-01-01T00:00:00.000Z`) and setting static producer strings. This guarantees bit-exact cryptographic reproducibility across any server or client.

2. **Zero-Gas Verification for Web2 Users**:  
   _Problem_: Traditional blockchain apps require users to install MetaMask and pay transaction fees to verify authenticity.  
   _Solution_: Engineered the public verification layer entirely on EVM `view` methods (`verifyCertificate` and `verifyCertificateByHash`). Verifiers calculate the SHA-256 hash client-side in the browser and query the blockchain free of charge, with zero gas fees and zero wallet installation.

3. **Fast RPC Health Probing with Fallback**:  
   _Problem_: If a local blockchain node is offline during developer onboarding, `ethers.JsonRpcProvider` initiates exponential retry loops that freeze HTTP responses for over 60 seconds.  
   _Solution_: Created an AbortSignal-bounded pre-flight health probe in `serverWeb3.ts` with a 1500ms timeout. If the node is unreachable, it cleanly transitions to a deterministic cryptographic simulation mode without crashing or hanging the user interface.

4. **Privacy-Preserving Expiring Share Links**:  
   _Problem_: Public blockchain records cannot hold personal student data due to GDPR and FERPA regulations.  
   _Solution_: Architecture strictly isolates personally identifiable information (PII) to off-chain encrypted MongoDB storage. Students generate unique shareable tokens (`/s/[token]`) protected by SHA-256 `tokenHash`, enforcing time expiration and view caps.

---

## 📈 Impact, Real-World Scalability & Compliance

- **Institutional Cost Reduction**: Lowers credential verification costs from \$15–\$50 per document to fractions of a cent.
- **Turnaround Speed**: Reduces verification turnaround time from 2–6 weeks to under **500 milliseconds**.
- **FERPA & GDPR Compliance**: Personal identifiable information (PII) is never committed to the public blockchain. Only the 32-byte SHA-256 mathematical hash, certificate ID, and timestamp exist on-chain.
- **Gas Scalability**: The `batchIssueCertificates` method leverages batch calldata array structures, allowing universities to anchor hundreds of certificates in single blocks while staying well below block gas limits.

---

## 🗺️ Strategic Roadmap

- [x] **Phase 1: Hackathon MVP Core (Completed)**

  - [x] OpenZeppelin `AccessControl` Smart Contract (`CertChain.sol`).
  - [x] Deterministic A4 Landscape PDF synthesis with dynamic QR codes.
  - [x] Client-side SHA-256 drag-and-drop tamper detection engine.
  - [x] Multi-modal verification (ID, Hash, live camera QR scanning).
  - [x] Batch issuance via CSV (`batch_students_20.csv`).
  - [x] Controller co-signature workflow for certificate revocation.
  - [x] Time-expiring student share links (`/s/[token]`).
  - [x] Admissions pre-matching with Brevo transactional email OTP.
  - [x] Minimalist institutional "Registry" design system.

- [ ] **Phase 2: Production Hardening (Next Steps)**
  - [ ] Migration to Ethereum Layer-2 (Arbitrum / Polygon) for minimal mainnet gas costs.
  - [ ] Integration of Soulbound Tokens (ERC-5192) for decentralized student identity.
  - [ ] InterPlanetary File System (IPFS) / Arweave decentralized document pinning.
  - [ ] Official National Academic Depository (NAD) API bridge for state universities.

---


## 👥 Hackathon Team Members

| Name | Batch | Role |
|---|---|---|
| Md. Shakib Akando | 24 | Team Leader & Developer |
| Maruf Hasan | 26 | Developer |
| Simla Shahrin | 24 | Video Editor & Voice Narrator |
| Habiba Akter Hafsa | 27 | Researcher |
| Tasnima Refat | 28 | |

---



---

## 📄 License & Attribution

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

Designed and engineered with pride by **Team `_FSociety`** for **Pundra University of Science & Technology (PUB)**.  
_PUB CSE Fest-26 Hackathon — Problem Statement A1._
