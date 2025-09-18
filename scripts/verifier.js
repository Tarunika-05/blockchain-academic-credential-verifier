require("dotenv").config();
const { ethers } = require("ethers");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const artifact = require("../build/contracts/CredentialNFT.json");
const networkId = Object.keys(artifact.networks)[0];
const contractAddress = artifact.networks[networkId].address;
const abi = artifact.abi;

const contract = new ethers.Contract(contractAddress, abi, provider);

async function main() {
  if (!args.id) throw new Error("❌ Provide --id <tokenId>");

  const owner = await contract.ownerOf(args.id);
  const uri = await contract.tokenURI(args.id);

  console.log(`🔍 Token ${args.id}`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Metadata URI: ${uri}`);
}

main().catch(console.error);
