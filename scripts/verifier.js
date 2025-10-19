const axios = require("axios");
require("dotenv").config();
const { ethers } = require("ethers");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2), {
  string: ["id"], // force tokenId to be string
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const artifact = require("../build/contracts/CredentialNFT.json");
const networkId = Object.keys(artifact.networks)[0];
const contractAddress = artifact.networks[networkId].address;
const abi = artifact.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);

async function main() {
  if (!args.id) {
    throw new Error("❌ Provide --id <tokenId>");
  }

  const tokenId = String(args.id).trim();

  console.log(`🔍 Verifying Token ${tokenId}...`);

  // ✅ Check owner
  const owner = await contract.ownerOf(tokenId);
  console.log(`   👤 Owner: ${owner}`);

  // ✅ Fetch URI
  const uri = await contract.tokenURI(tokenId);
  console.log(`   🔗 Metadata URI: ${uri}`);

  // ✅ Fetch metadata if IPFS/HTTP
  if (uri.startsWith("ipfs://") || uri.startsWith("http")) {
    const url = uri.startsWith("ipfs://")
      ? `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`
      : uri;

    try {
      const res = await axios.get(url);
      const data = res.data;

      // Print all relevant details
      console.log("   📄 Credential Details:");
      console.log(`     Name:       ${data.name || "-"}`);
      console.log(
        `     Degree:     ${
          data.attributes?.find((a) => a.trait_type === "Degree")?.value || "-"
        }`
      );
      console.log(
        `     Year:       ${
          data.attributes?.find((a) => a.trait_type === "Year")?.value || "-"
        }`
      );
      console.log(
        `     CGPA:       ${
          data.attributes?.find((a) => a.trait_type === "CGPA")?.value || "-"
        }`
      );
      console.log(
        `     Student:    ${
          data.attributes?.find((a) => a.trait_type === "Issued To")?.value ||
          "-"
        }`
      );
      console.log(
        `     Address:    ${
          data.attributes?.find((a) => a.trait_type === "Student Address")
            ?.value || "-"
        }`
      );
      console.log(
        `     University: ${
          data.attributes?.find((a) => a.trait_type === "University")?.value ||
          "-"
        }`
      );
      console.log(`     Issued By:  ${data.issuedBy || "-"}`);
      console.log(`     Timestamp:  ${data.timestamp || "-"}`);
    } catch (err) {
      console.error("   ❌ Could not fetch metadata:", err.message);
    }
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
