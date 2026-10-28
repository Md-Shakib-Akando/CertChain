// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertChain
 * @notice Permanent, tamper-proof academic certificate registry for PUB CertChain.
 * @dev Enforces Role-Based Access Control (Admin, Issuer, Controller).
 */
contract CertChain is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    struct CertificateRecord {
        string certId;
        bytes32 sha256Hash;
        address issuer;
        uint256 issuedAt;
        bool isRevoked;
        string revocationReason;
        uint256 revokedAt;
        address revokedBy;
    }

    // Mapping from Certificate ID to Certificate Details
    mapping(string => CertificateRecord) private certificates;
    // Mapping from SHA-256 Hash to Certificate ID for reverse lookup
    mapping(bytes32 => string) private hashToCertId;
    // Track total certificate IDs
    string[] private allCertIds;

    // Events
    event CertificateIssued(
        string indexed certId,
        bytes32 indexed sha256Hash,
        address indexed issuer,
        uint256 issuedAt
    );

    event CertificateRevoked(
        string indexed certId,
        address indexed controller,
        string reason,
        uint256 revokedAt
    );

    event IssuerAdded(address indexed account, address indexed addedBy);
    event IssuerRemoved(address indexed account, address indexed removedBy);
    event ControllerAdded(address indexed account, address indexed addedBy);

    /**
     * @notice Initializes contract roles
     * @param superAdmin Address with DEFAULT_ADMIN_ROLE (can manage roles)
     * @param initialController Address with CONTROLLER_ROLE (authorized to approve revocations)
     */
    constructor(address superAdmin, address initialController) {
        address admin = superAdmin != address(0) ? superAdmin : msg.sender;
        address controller = initialController != address(0) ? initialController : msg.sender;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CONTROLLER_ROLE, controller);

        // DEFAULT_ADMIN_ROLE is the admin role for ISSUER_ROLE & CONTROLLER_ROLE by default
        _setRoleAdmin(ISSUER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(CONTROLLER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    // ==========================================
    // ROLE MANAGEMENT CONVENIENCE FUNCTIONS
    // ==========================================

    function addIssuer(address account) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(CONTROLLER_ROLE, msg.sender),
            "Caller is not admin or controller"
        );
        require(account != address(0), "Invalid address");
        _grantRole(ISSUER_ROLE, account);
        emit IssuerAdded(account, msg.sender);
    }

    function removeIssuer(address account) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(CONTROLLER_ROLE, msg.sender),
            "Caller is not admin or controller"
        );
        _revokeRole(ISSUER_ROLE, account);
        emit IssuerRemoved(account, msg.sender);
    }

    function addController(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(CONTROLLER_ROLE, account);
        emit ControllerAdded(account, msg.sender);
    }

    // ==========================================
    // CERTIFICATE ISSUANCE (ISSUER_ROLE ONLY)
    // ==========================================

    /**
     * @notice Issue a single academic certificate record on-chain
     * @param certId Unique certificate identifier (e.g. PUB-CSE-2026-0042)
     * @param sha256Hash SHA-256 hash of the canonical certificate metadata/file
     */
    function issueCertificate(
        string calldata certId,
        bytes32 sha256Hash
    ) external onlyRole(ISSUER_ROLE) {
        _issue(certId, sha256Hash);
    }

    /**
     * @notice Batch issue multiple certificates in a single transaction (saves gas & time)
     */
    function batchIssueCertificates(
        string[] calldata certIds,
        bytes32[] calldata sha256Hashes
    ) external onlyRole(ISSUER_ROLE) {
        require(certIds.length == sha256Hashes.length, "Arrays length mismatch");
        for (uint256 i = 0; i < certIds.length; i++) {
            _issue(certIds[i], sha256Hashes[i]);
        }
    }

    function _issue(string calldata certId, bytes32 sha256Hash) internal {
        require(bytes(certId).length > 0, "Certificate ID cannot be empty");
        require(sha256Hash != bytes32(0), "Invalid certificate hash");
        require(certificates[certId].issuedAt == 0, "Certificate ID already exists");
        require(bytes(hashToCertId[sha256Hash]).length == 0, "Certificate hash already registered");

        certificates[certId] = CertificateRecord({
            certId: certId,
            sha256Hash: sha256Hash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            isRevoked: false,
            revocationReason: "",
            revokedAt: 0,
            revokedBy: address(0)
        });

        hashToCertId[sha256Hash] = certId;
        allCertIds.push(certId);

        emit CertificateIssued(certId, sha256Hash, msg.sender, block.timestamp);
    }

    // ==========================================
    // REVOCATION APPROVAL (CONTROLLER_ROLE ONLY)
    // ==========================================

    /**
     * @notice Controller approves revocation of a certificate
     * @param certId Target certificate ID
     * @param reason Documented justification for revocation
     */
    function approveRevocation(
        string calldata certId,
        string calldata reason
    ) external onlyRole(CONTROLLER_ROLE) {
        CertificateRecord storage cert = certificates[certId];
        require(cert.issuedAt > 0, "Certificate does not exist");
        require(!cert.isRevoked, "Certificate is already revoked");
        require(bytes(reason).length > 0, "Revocation reason is required");

        cert.isRevoked = true;
        cert.revocationReason = reason;
        cert.revokedAt = block.timestamp;
        cert.revokedBy = msg.sender;

        emit CertificateRevoked(certId, msg.sender, reason, block.timestamp);
    }

    // ==========================================
    // PUBLIC VERIFICATION (CALL / READ ONLY - ZERO GAS)
    // ==========================================

    /**
     * @notice Verify a certificate by its unique Certificate ID
     */
    function verifyCertificate(
        string calldata certId
    ) external view returns (
        bool exists,
        bool isValid,
        bytes32 sha256Hash,
        address issuer,
        uint256 issuedAt,
        string memory revocationReason,
        uint256 revokedAt,
        address revokedBy
    ) {
        CertificateRecord memory cert = certificates[certId];
        if (cert.issuedAt == 0) {
            return (false, false, bytes32(0), address(0), 0, "", 0, address(0));
        }
        return (
            true,
            !cert.isRevoked,
            cert.sha256Hash,
            cert.issuer,
            cert.issuedAt,
            cert.revocationReason,
            cert.revokedAt,
            cert.revokedBy
        );
    }

    /**
     * @notice Verify a certificate by its SHA-256 hash (file check)
     */
    function verifyCertificateByHash(
        bytes32 sha256Hash
    ) external view returns (
        bool exists,
        bool isValid,
        string memory certId,
        address issuer,
        uint256 issuedAt,
        string memory revocationReason,
        uint256 revokedAt,
        address revokedBy
    ) {
        string memory id = hashToCertId[sha256Hash];
        if (bytes(id).length == 0) {
            return (false, false, "", address(0), 0, "", 0, address(0));
        }
        CertificateRecord memory cert = certificates[id];
        return (
            true,
            !cert.isRevoked,
            cert.certId,
            cert.issuer,
            cert.issuedAt,
            cert.revocationReason,
            cert.revokedAt,
            cert.revokedBy
        );
    }

    /**
     * @notice Total number of registered certificates on-chain
     */
    function getTotalCertificates() external view returns (uint256) {
        return allCertIds.length;
    }
}
