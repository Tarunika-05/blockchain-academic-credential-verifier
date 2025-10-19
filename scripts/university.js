// scripts/university.js
require("dotenv").config();
const { ethers } = require("ethers");
const minimist = require("minimist");

// ✅ force all CLI flags to be parsed as strings
const args = minimist(process.argv.slice(2), {
  string: ["student", "ipfs", "unis", "role", "action", "id", "approve"],
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const artifact = require("../build/contracts/CredentialNFT.json");
const networkId = Object.keys(artifact.networks)[0];
const contractAddress = artifact.networks[networkId].address;
const abi = artifact.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);

// Match address with PK from .env (ACC1_PK .. ACC9_PK)
function getWalletFromEnv(accAddress) {
  for (let i = 1; i <= 9; i++) {
    const pk = process.env[`ACC${i}_PK`];
    if (!pk) continue;
    const wallet = new ethers.Wallet(pk);
    if (wallet.address.toLowerCase() === accAddress.toLowerCase()) {
      return new ethers.Wallet(pk, provider);
    }
  }
  throw new Error(`❌ No private key found in .env for ${accAddress}`);
}

async function main() {
  const accountsRaw = await provider.listAccounts();
  const accounts = accountsRaw.map((a) =>
    typeof a === "string" ? a : a.address
  );

  // Only registered universities
  const universities = [];
  for (let acc of accounts) {
    const isUni = await contract.isUniversity(acc);
    if (isUni) universities.push(acc);
  }

  if (universities.length === 0) {
    console.log("❌ No universities added yet. Admin should add them first.");
    return;
  }

  const roleIndex = parseInt(args.role, 10) - 1;
  if (
    Number.isNaN(roleIndex) ||
    roleIndex < 0 ||
    roleIndex >= universities.length
  ) {
    console.log(
      "❌ Invalid role number. Available:",
      universities.map((_, i) => i + 1)
    );
    return;
  }

  const uniAddress = universities[roleIndex];
  const wallet = getWalletFromEnv(uniAddress);
  const contractWithSigner = contract.connect(wallet);

  // ---------------- ACTIONS ----------------
  if (args.action === "propose") {
    // Validate all required fields
    if (
      !args.name ||
      !args.degree ||
      !args.year ||
      !args.student ||
      !args.cgpa ||
      !args.university
    ) {
      console.log(
        "❌ Provide --name --degree --year --student --cgpa --university"
      );
      return;
    }
    if (!args.ipfs) {
      console.log("❌ Provide --ipfs <metadataURI>");
      return;
    }
    if (!ethers.isAddress(args.student)) {
      console.log("❌ Provide a valid --student <0xaddress>");
      return;
    }

    console.log(`→ University: ${uniAddress}`);
    console.log(`→ Student:    ${args.student}`);
    console.log(`→ Name:       ${args.name}`);
    console.log(`→ Degree:     ${args.degree}`);
    console.log(`→ Year:       ${args.year}`);
    console.log(`→ CGPA:       ${args.cgpa}`);
    console.log(`→ University: ${args.university}`);
    console.log(`→ IPFS:       ${args.ipfs}`);

    try {
      // Send transaction to propose credential with IPFS metadata URI
      const tx = await contractWithSigner.proposeCredential(
        args.student,
        args.ipfs
      );
      await tx.wait();
      console.log(
        `✅ University ${uniAddress} proposed credential for ${args.student}`
      );
    } catch (err) {
      console.error("⚠️ Contract call failed:", err.message || err);
    }
  } else if (args.action === "vote") {
    if (!args.id || typeof args.approve === "undefined") {
      console.log("❌ Provide --id <proposalId> and --approve <true|false>");
      return;
    }
    try {
      const tx = await contractWithSigner.voteOnCredential(
        args.id,
        args.approve === "true"
      );
      await tx.wait();
      console.log(
        `✅ University ${uniAddress} voted on proposal ${args.id} (${args.approve})`
      );
    } catch (err) {
      console.error("⚠️ Contract call failed:", err.message || err);
    }
  }
  // Add after your existing if/else actions in main()
  else if (args.action === "list") {
    console.log(`→ University: ${uniAddress}`);

    const count = await contractWithSigner.proposalCount();
    console.log(`Total proposals on-chain: ${count.toString()}`);

    const pending = [];

    for (let i = 1; i <= count; i++) {
      // ✅ Use the getter instead of contract.proposals(i)
      const p = await contractWithSigner.getProposalInfo(i);

      // Only proposals by this university
      if (p.proposer.toLowerCase() !== uniAddress.toLowerCase()) continue;

      pending.push({
        id: p.id.toString(),
        student: p.student,
        approvals: Number(p.approvals),
        rejections: Number(p.rejections),
        minted: p.minted,
        metadataURI: p.metadataURI,
      });
    }

    if (pending.length === 0) {
      console.log("No proposals found for this university.");
    } else {
      console.log("Pending / all proposals for this university:");
      console.table(pending);
    }
  } else if (args.action === "list-others") {
    console.log(
      `→ University: ${uniAddress} (checking other universities' proposals)`
    );

    const count = await contractWithSigner.proposalCount();
    console.log(`Total proposals on-chain: ${count.toString()}`);

    const others = [];

    for (let i = 1; i <= count; i++) {
      const p = await contractWithSigner.getProposalInfo(i);

      // Skip your own university
      if (p.proposer.toLowerCase() === uniAddress.toLowerCase()) continue;

      // Skip already minted proposals
      if (p.minted) continue;

      others.push({
        id: p.id.toString(),
        proposer: p.proposer,
        student: p.student,
        approvals: Number(p.approvals),
        rejections: Number(p.rejections),
        minted: p.minted,
        metadataURI: p.metadataURI,
      });
    }

    if (others.length === 0) {
      console.log("No pending proposals from other universities.");
    } else {
      console.log("Pending proposals from other universities:");
      console.table(others);
    }
  } else if (args.action === "mint") {
    if (!args.id) {
      console.log("❌ Provide --id <proposalId>");
      return;
    }
    try {
      const tx = await contractWithSigner.mintCredential(args.id);
      await tx.wait();
      console.log(`✅ Proposal ${args.id} minted to student`);
    } catch (err) {
      console.error("⚠️ Contract call failed:", err.message || err);
    }
  } else {
    console.log("❌ Invalid action. Use propose | vote | mint");
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err && err.message ? err.message : err);
});
