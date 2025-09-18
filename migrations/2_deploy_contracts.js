const CredentialNFT = artifacts.require("CredentialNFT");

module.exports = async function (deployer) {
  try {
    console.log("🚀 Deploying CredentialNFT...");
    // Set approval threshold = 2 (means at least 2 universities must approve)
    await deployer.deploy(CredentialNFT, 2);
    const instance = await CredentialNFT.deployed();
    console.log("✅ CredentialNFT deployed at:", instance.address);
  } catch (err) {
    console.error("❌ Deployment failed!");
    console.error("Error message:", err.message);
  }
};
