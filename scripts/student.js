// scripts/student.js
const axios = require("axios");
require("dotenv").config();
const { ethers } = require("ethers");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2), {
  string: ["student", "studentIndex"], // force CLI values to strings
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const artifact = require("../build/contracts/CredentialNFT.json");
const networkId = Object.keys(artifact.networks)[0];
const contractAddress = artifact.networks[networkId].address;
const abi = artifact.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);

async function main() {
  const accountsRaw = await provider.listAccounts();
  const accounts = accountsRaw.map((a) =>
    typeof a === "string" ? a : a.address
  );

  let student = null;

  // 1️⃣ CLI --student (quoted in PowerShell!)
  if (args.student) {
    student = String(args.student).trim();
  }

  // 2️⃣ CLI --studentIndex (safe integer)
  if (!student && args.studentIndex) {
    const idx = parseInt(args.studentIndex, 10) - 1;
    if (idx < 0 || idx >= accounts.length) {
      throw new Error(
        `❌ Invalid --studentIndex ${args.studentIndex}. Valid range: 1..${accounts.length}`
      );
    }
    student = accounts[idx];
  }

  // 3️⃣ .env fallback
  if (!student && process.env.STUDENT_ADDR) {
    student = process.env.STUDENT_ADDR;
  }

  if (!student) {
    throw new Error(
      "❌ No student address provided.\nUse one of:\n" +
        '  --student "0x..."\n' +
        "  --studentIndex <N> (recommended on Windows)\n" +
        "  STUDENT_ADDR in .env\n"
    );
  }

  // ✅ Validate checksum
  try {
    student = ethers.getAddress(student);
  } catch {
    throw new Error(`❌ Invalid Ethereum address: ${student}`);
  }

  console.log(`🎓 Student ${student} owns the following credential(s):`);

  // 🔎 Query minted credentials
  const filter = contract.filters.Transfer(null, student);
  const events = await contract.queryFilter(filter, 0, "latest");

  if (events.length === 0) {
    console.log("- None");
    return;
  }

  for (const e of events) {
    const tokenId = e.args.tokenId.toString();
    const uri = await contract.tokenURI(tokenId);
    console.log(`- Token ${tokenId} → ${uri}`);
    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
      try {
        const res = await axios.get(url);
        console.log("   📄 Metadata:", res.data);
      } catch (err) {
        console.error("   ❌ Could not fetch metadata:", err.message);
      }
    }
  }

  console.log(`✅ Total: ${events.length} credential(s)`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
