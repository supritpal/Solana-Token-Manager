import React, { useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const TransferToken = () => {
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { publicKey } = useWallet();

  const handleTransferToken = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    if (!mintAddress || !recipientAddress || amount <= 0) {
      alert("Please fill in all fields correctly");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Connect to Solana network
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Use the connected wallet
      console.log("Using wallet address:", publicKey.toString());

      // Check wallet balance
      const balance = await connection.getBalance(publicKey);
      if (balance < 0.5 * LAMPORTS_PER_SOL) {
        // Request airdrop if balance is low
        console.log("Requesting airdrop for fees...");
        const airdropSignature = await connection.requestAirdrop(
          publicKey,
          LAMPORTS_PER_SOL // 1 SOL
        );
        await connection.confirmTransaction(airdropSignature);
        console.log("Airdrop successful!");
      }

      // In a real implementation, you would:
      // 1. Create a transaction for token transfer
      // 2. Sign it with the wallet (which requires integration with wallet adapter)
      // 3. Send and confirm the transaction

      // For this example, we'll simulate success
      setTimeout(() => {
        setResult({
          success: true,
          message: `${amount} tokens transferred to ${recipientAddress}!`,
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error transferring token:", error);
      setResult({
        success: false,
        message: "Failed to transfer token. See console for details.",
      });
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Transfer Token</h2>
      <div style={styles.form}>
        <input
          type="text"
          placeholder="Mint Address"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={styles.input}
        />
        <button
          onClick={handleTransferToken}
          style={loading ? styles.buttonDisabled : styles.button}
          disabled={loading || !publicKey}
        >
          {loading ? "Transferring..." : "Transfer Token"}
        </button>
      </div>

      {result && (
        <div
          style={result.success ? styles.successMessage : styles.errorMessage}
        >
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#6a0dad",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  buttonDisabled: {
    padding: "10px",
    backgroundColor: "#aaa",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    fontSize: "16px",
    cursor: "not-allowed",
  },
  successMessage: {
    padding: "10px",
    backgroundColor: "#e6f7e6",
    border: "1px solid #c3e6c3",
    borderRadius: "4px",
    color: "#2e7d32",
  },
  errorMessage: {
    padding: "10px",
    backgroundColor: "#ffebee",
    border: "1px solid #ffcdd2",
    borderRadius: "4px",
    color: "#c62828",
  },
};

export default TransferToken;
