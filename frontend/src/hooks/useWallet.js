import { useState, useEffect } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";

export default function useWallet() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await isConnected();
      if (result.isConnected !== undefined) {
        setIsInstalled(true);
      }
      if (result.isConnected) {
        const addressResult = await getAddress();
        if (addressResult.address) {
          setWalletAddress(addressResult.address);
        }
      }
    } catch (e) {
      console.log("Freighter not detected:", e);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const accessResult = await requestAccess();
      if (accessResult.error) {
        alert("Connection rejected: " + accessResult.error);
        return;
      }
      const addressResult = await getAddress();
      if (addressResult.address) {
        setWalletAddress(addressResult.address);
        setIsInstalled(true);
      }
    } catch (e) {
      alert("Failed to connect: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => setWalletAddress(null);

  return {
    walletAddress,
    isInstalled,
    loading,
    connectWallet,
    disconnectWallet,
  };
}
