const express = require("express");
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Load ABI and contract address
const abiPath = path.resolve(__dirname, "./build/contracts/CredentialNFT.json");
const contractJson = JSON.parse(fs.readFileSync(abiPath));
const CONTRACT_ABI = contractJson.abi;
const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // your deployed address
const PRIVATE_KEY =
  "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Ganache Account 0

// Setup Web3
const PROVIDER = "http://127.0.0.1:8545";
const web3 = new Web3(PROVIDER);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Load Contract
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Mint Credential Endpoint
app.post("/mintCredential", async (req, res) => {
  const { studentAddress, metadataURI } = req.body;

  try {
    const gasEstimate = await contract.methods
      .mintCredential(studentAddress, metadataURI)
      .estimateGas({ from: account.address });

    const tx = await contract.methods
      .mintCredential(studentAddress, metadataURI)
      .send({ from: account.address, gas: gasEstimate });

    res.json({
      success: true,
      txHash: tx.transactionHash,
      tokenId: (await contract.methods.nextTokenId().call()) - 1,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify Credential Endpoint
app.get("/verifyCredential/:id", async (req, res) => {
  const tokenId = req.params.id;
  try {
    const uri = await contract.methods.tokenURI(tokenId).call();
    res.json({ tokenId, uri });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
