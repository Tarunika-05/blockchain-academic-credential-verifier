require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { ethers } = require("ethers");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const artifact = require("../build/contracts/CredentialNFT.json");
const networkId = Object.keys(artifact.networks)[0];
const contractAddress = artifact.networks[networkId].address;
const abi = artifact.abi;

const admin = new ethers.Wallet(process.env.ADMIN_PK, provider);
const contract = new ethers.Contract(contractAddress, abi, provider);

async function main() {
  console.log("Admin PK:", process.env.ADMIN_PK);

  if (!args.unis) {
    throw new Error("❌ Provide --unis <addr1,addr2,...>");
  }

  const uniAccounts = args.unis.split(",");
  const contractWithSigner = contract.connect(admin);

  // 🔹 Fetch the current nonce once
  let nonce = await provider.getTransactionCount(admin.address, "latest");

  for (let uni of uniAccounts) {
    try {
      const tx = await contractWithSigner.addUniversity(uni.trim(), { nonce });
      await tx.wait();
      console.log(`✅ University added: ${uni}`);
      nonce++; // 🔹 increment manually for next tx
    } catch (err) {
      console.log(`⚠️  Could not add ${uni}: ${err.message}`);
    }
  }
}

main().catch(console.error);
