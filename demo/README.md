# PUB CertChain Demonstration Files

This folder contains test certificates designed for hackathon judges, evaluators, and security auditors to test the end-to-end cryptographic integrity, tamper detection, and revocation systems of **PUB CertChain**.

---

## Files Included

| File | Type | Target Cert ID | Graduate Name | Ledger Status | Expected Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PUB-DEG-2026-000105.pdf` | Authentic Certificate | `PUB-DEG-2026-000105` | Md. Shakib Akando | **VALID** | **Verified Authentic** (Green Banner, Full Student Data, On-Chain Anchor) |
| `PUB-DEG-2026-000105-tampered.pdf` | Tampered / Forged File | `PUB-DEG-2026-000105` | Md. Shakib Akando | **INVALID** | **Security Alert: Tamper Detected** (Red Alert, Hash Mismatch Comparison) |
| `CERT-DEMO-2026-002-revoked.pdf` | Revoked Certificate | `CERT-DEMO-2026-002` | Nusrat Jahan Chowdhury | **REVOKED** | **Certificate Revoked** (Warning Banner, Revocation Date & Syndicate Reason) |

---

## How to Test in Web Application

1. Open the application homepage at **`http://localhost:3000`**.
2. Scroll to the **Quick Verification** section (or click **Verify** in the navigation header).
3. Select the **"Upload PDF"** tab.
4. Drag & drop or browse to choose:
   - **Upload `PUB-DEG-2026-000105.pdf`**:
     - The browser computes the client-side SHA-256 fingerprint (`c1dbba77e693ebb2a18510ae6b4a2546650395f67186912934aa54752338bf13`).
     - Matches the on-chain registry record.
     - Modal pops up with **● Verified Authentic**, Graduate Name, Degree, CGPA, and Transaction Hash.
   - **Upload `PUB-DEG-2026-000105-tampered.pdf`**:
     - The browser computes the altered SHA-256 fingerprint (`0e2b6ef2f721ed7fa0aeaeb488b6f3a7e45f6da7cea6dae61e4e363494d56a13`).
     - Detects that this file claims to be `PUB-DEG-2026-000105` but its cryptographic hash does not match the immutable ledger record.
     - Modal pops up with **● Tampered File / Security Alert**.
     - Displays the side-by-side comparison:
       - **Computed File Hash (Uploaded File)**: `0e2b6ef2f721ed7fa0aeaeb488b6f3a7e45f6da7cea6dae61e4e363494d56a13`
       - **Anchored Ledger Hash (Official Record)**: `c1dbba77e693ebb2a18510ae6b4a2546650395f67186912934aa54752338bf13`
     - Automatically logs a `SECURITY_ALERT_TAMPERING_DETECTED` entry to the immutable audit trail with IP address and timestamp.
   - **Upload or search `CERT-DEMO-2026-002-revoked.pdf`**:
     - Modal pops up with **● Revoked Record** and displays the University Controller's revocation reason.

---

## How to Test via Automated Verification Script

Run the verification test suite in your terminal:
```bash
node scratch/test-verification.mjs
```

All cryptographic assertions, SHA-256 comparisons, and tamper alert tests will run and print formatted status outputs.
