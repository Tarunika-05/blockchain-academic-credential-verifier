// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin libraries
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CredentialNFT - Decentralized Autonomous University (DAU) Credential System
/// @notice Universities propose + vote on student credentials before minting as NFTs
contract CredentialNFT is ERC721URIStorage, Ownable {
    uint public proposalCount = 0;
    uint public tokenIdCounter = 1;
    uint public approvalThreshold; // minimum votes required

    // Proposal struct
    struct Proposal {
        uint id;
        address proposer;
        address student;
        string metadataURI; // usually an IPFS URI with JSON metadata
        uint approvals;
        uint rejections;
        bool minted;
    }

    // Storage
    mapping(uint => Proposal) private proposals; // proposalId => Proposal
    mapping(uint => mapping(address => bool)) public hasVoted; // tracks if uni voted
    mapping(address => bool) public isUniversity; // approved universities

    // Events
    event UniversityAdded(address uni);
    event CredentialProposed(uint proposalId, address proposer, address student);
    event CredentialVoted(uint proposalId, address voter, bool approved);
    event CredentialMinted(uint proposalId, address student, uint tokenId);

    // Constructor
    constructor(uint _threshold) ERC721("CredentialNFT", "CRED") Ownable() {

        require(_threshold > 0, "Threshold must be > 0");
        approvalThreshold = _threshold;
    }

    // --- Admin Functions ---
    function addUniversity(address uni) external onlyOwner {
        require(!isUniversity[uni], "Already added");
        isUniversity[uni] = true;
        emit UniversityAdded(uni);
    }

    // --- University Functions ---

    /// @notice University proposes a credential for a student
    function proposeCredential(address student, string memory metadataURI) external {
        require(isUniversity[msg.sender], "Only university can propose");
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.proposer = msg.sender;
        p.student = student;
        p.metadataURI = metadataURI;
        emit CredentialProposed(proposalCount, msg.sender, student);
    }

    /// @notice University votes approve/reject on a proposal
    function voteOnCredential(uint proposalId, bool approve) external {
        require(isUniversity[msg.sender], "Only university can vote");
        Proposal storage p = proposals[proposalId];
        require(!p.minted, "Already minted");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (approve) {
            p.approvals++;
        } else {
            p.rejections++;
        }

        emit CredentialVoted(proposalId, msg.sender, approve);
    }

    /// @notice Mint NFT after enough approvals
    function mintCredential(uint proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.minted, "Already minted");
        require(p.approvals >= approvalThreshold, "Not enough approvals");
        require(p.approvals > p.rejections, "Rejected by majority");

        uint newId = tokenIdCounter;
        _mint(p.student, newId);
        _setTokenURI(newId, p.metadataURI);
        tokenIdCounter++;

        p.minted = true;

        emit CredentialMinted(proposalId, p.student, newId);
    }

    // --- Getter for Proposal Info ---
    function getProposalInfo(uint proposalId) external view returns (
        uint id,
        address proposer,
        address student,
        string memory metadataURI,
        uint approvals,
        uint rejections,
        bool minted
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.proposer,
            p.student,
            p.metadataURI,
            p.approvals,
            p.rejections,
            p.minted
        );
    }
}
