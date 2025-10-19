import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found!");

  // This forces MetaMask popup every time
  await window.ethereum.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  });

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) throw new Error("No accounts found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(accounts[0]);

  return { signer, provider, accounts };
}

export async function getContract() {
  // fetch ABI + address from backend
  const res = await fetch("http://localhost:5000/contract-info");
  const { address, abi } = await res.json();

  const { signer, provider } = await connectWallet();
  const contract = new ethers.Contract(address, abi, signer);

  return { contract, signer, provider };
}
