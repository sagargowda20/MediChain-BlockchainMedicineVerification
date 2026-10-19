import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from "../contracts/contractConfig";

const BlockchainContext = createContext(null);

export function BlockchainProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const medicineContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setAccount(accounts[0]);
      setContract(medicineContract);

      console.log("Connected account:", accounts[0]);
      console.log("Contract:", CONTRACT_ADDRESS);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }

  return (
    <BlockchainContext.Provider
      value={{
        account,
        contract,
        connectWallet,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  return useContext(BlockchainContext);
}