require("dotenv").config();
const axios = require("axios");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

async function uploadMetadata() {
  if (!args.name || !args.degree || !args.year || !args.student) {
    throw new Error("Provide --name --degree --year --student");
  }

  const metadata = {
    name: `${args.degree} - ${args.name}`,
    description: "Credential issued by DAU Prototype, 2025",
    image: "https://via.placeholder.com/200",
    attributes: [
      { trait_type: "Degree", value: args.degree },
      { trait_type: "Year", value: args.year },
      { trait_type: "Issued To", value: args.name },
    ],
  };

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  console.log("✅ Metadata pinned to IPFS!");
  console.log("IPFS Hash:", res.data.IpfsHash);
  console.log(
    "Gateway URL:",
    `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
  );
}

uploadMetadata().catch(console.error);
