require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// --- Upload metadata to Pinata ---
app.post("/upload-metadata", async (req, res) => {
  const { name, degree, year, student, cgpa, university } = req.body;

  if (!name || !degree || !year || !student || !cgpa || !university) {
    return res.status(400).json({
      error:
        "Missing fields. Provide name, degree, year, student, cgpa, and university",
    });
  }

  const metadata = {
    name: `${degree} - ${name}`,
    description: `Credential issued by ${university}, ${year}`,
    image: "https://via.placeholder.com/200",
    attributes: [
      { trait_type: "Degree", value: degree },
      { trait_type: "Year", value: year },
      { trait_type: "CGPA", value: cgpa },
      { trait_type: "Issued To", value: name },
      { trait_type: "Student Address", value: student },
      { trait_type: "University", value: university },
    ],
    issuedBy: university,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ ipfsHash: response.data.IpfsHash });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to pin metadata" });
  }
});

// --- Contract info route ---
app.get("/contract-info", (req, res) => {
  try {
    const artifactPath = path.join(
      __dirname,
      "build/contracts/CredentialNFT.json"
    );
    const artifact = require(artifactPath);

    // Check if network info exists
    const networks = artifact.networks || {};
    const networkIds = Object.keys(networks);
    if (!networkIds.length)
      return res.status(500).json({ error: "Contract not deployed" });

    const networkId = networkIds[networkIds.length - 1]; // latest deployment
    const address = networks[networkId].address;

    res.json({
      address,
      abi: artifact.abi,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load contract info" });
  }
});
app.get("/fetch-metadata/:hash", async (req, res) => {
  const { hash } = req.params;

  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
  ];

  for (const url of gateways) {
    try {
      const response = await axios.get(url, { timeout: 150000 });
      // Add CORS header here
      res.set("Access-Control-Allow-Origin", "*");
      return res.json(response.data);
    } catch (err) {
      console.warn(`❌ Failed to fetch from ${url}:`, err.message);
      continue;
    }
  }

  res.status(500).json({ error: "All IPFS gateways failed" });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
