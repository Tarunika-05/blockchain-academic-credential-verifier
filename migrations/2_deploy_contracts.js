const CredentialNFT = artifacts.require("CredentialNFT");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(CredentialNFT, accounts[0]); // accounts[0] is contract owner
};
