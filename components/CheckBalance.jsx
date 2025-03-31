import React, { useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const CheckBalance = () => {
  const [mintAddress, setMintAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const { publicKey } = useWallet();

  const isValidPublicKey = (key) => {
    try {
      const trimmedKey = key.trim();
      if (trimmedKey.length !== 44) throw new Error("Invalid length");
      new PublicKey(trimmedKey);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleUseMyWallet = () => {
    if (publicKey) {
      setWalletAddress(publicKey.toString());
    }
  };

  const checkBalance = async () => {
    const trimmedMint = mintAddress.trim();
    const trimmedWallet = walletAddress.trim();

    if (!trimmedMint) {
      setError("Please enter a token mint address.");
      return;
    }
    if (!trimmedWallet) {
      setError("Please enter a wallet address.");
      return;
    }
    if (!isValidPublicKey(trimmedMint)) {
      setError(
        "Invalid mint address. Please enter a valid 44-character Solana address."
      );
      return;
    }
    if (!isValidPublicKey(trimmedWallet)) {
      setError("Invalid wallet address. Please enter a valid Solana address.");
      return;
    }

    try {
      setLoading(true);
      setBalance(null);
      setError(null);

      // Create a new connection to Solana devnet
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      const mint = new PublicKey(trimmedMint);
      const owner = new PublicKey(trimmedWallet);

      try {
        // Get the mint info first to make sure it exists
        const mintInfo = await getMint(connection, mint);
        const decimals = mintInfo.decimals;

        // Get the token account address
        const tokenAddress = await getAssociatedTokenAddress(mint, owner);

        try {
          // Try to get the token account
          const tokenAccount = await getAccount(connection, tokenAddress);
          const actualBalance =
            Number(tokenAccount.amount) / Math.pow(10, decimals);

          setBalance({
            tokenAddress: tokenAddress.toString(),
            amount: actualBalance,
            rawAmount: tokenAccount.amount.toString(),
          });
        } catch (err) {
          if (err instanceof TokenAccountNotFoundError) {
            setBalance({
              tokenAddress: tokenAddress.toString(),
              amount: 0,
              rawAmount: "0",
              message:
                "This wallet doesn't have a token account for this mint yet.",
            });
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("Error with mint:", err);
        setError(`Error: Invalid mint address or mint not found`);
      }
    } catch (err) {
      console.error("Error checking balance:", err);
      setError(`Error: ${err.message || "Failed to check balance"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Check Token Balance</h2>
      <input
        type="text"
        placeholder="Token Mint Address"
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button
        onClick={handleUseMyWallet}
        disabled={!publicKey}
        style={{ marginRight: "10px" }}
      >
        Use My Wallet
      </button>
      <button onClick={checkBalance} disabled={loading}>
        {loading ? "Checking..." : "Check Balance"}
      </button>
      {balance && (
        <div style={{ marginTop: "20px" }}>
          <h3>Balance: {balance.amount} tokens</h3>
          <p>Token Account: {balance.tokenAddress}</p>
          {balance.message && <p>{balance.message}</p>}
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CheckBalance;
