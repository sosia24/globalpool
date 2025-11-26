"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  address: string | null;
  setAddress: (address: string | null) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  setAddress: () => {},
  disconnect: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddressState] = useState<string | null>(null);

  const setAddress = (newAddress: string | null) => {
    if (newAddress) {
      sessionStorage.setItem("walletAddress", newAddress);
    } else {
      sessionStorage.removeItem("walletAddress");
    }
    setAddressState(newAddress);
  };

  const disconnect = () => {
    sessionStorage.removeItem("walletAddress");
    setAddressState(null);
  };

  useEffect(() => {
    const savedAddress = sessionStorage.getItem("walletAddress");

    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            setAddress(accounts[0]);
          } else if (savedAddress) {
            setAddress(savedAddress);
          } else {
            setAddress(null);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
          setAddress(null);
        }
      }
    };

    checkWalletConnection();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
        }
      });

      ethereum.on("connect", () => {
        checkWalletConnection();
      });

      ethereum.on("disconnect", () => {
        setAddress(null);
      });
    }

    return () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        ethereum.removeAllListeners("accountsChanged");
        ethereum.removeAllListeners("connect");
        ethereum.removeAllListeners("disconnect");
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ address, setAddress, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

// Provider Web3
function getProvider() {
  if (!(window as any).ethereum) {
    throw new Error("No wallet found (MetaMask / TrustWallet)");
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

// Login
export async function doLogin(
  setAddress: (address: string) => void,
  CHAIN_ID: string
) {
  try {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found / wallet denied.");
    }

    await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);

    const userAddress = accounts[0];
    setAddress(userAddress);

    return userAddress;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
