import { SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const CreateToken = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { publicKey, signTransaction } = useWallet();

  const handleCreateToken = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    if (!name || !symbol || decimals < 0) {
      alert("Please enter valid token details");
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

      // Use the connected wallet's public key
      console.log("Using wallet address:", publicKey.toString());

      // Check if wallet has enough SOL
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

      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintAddress = mintKeypair.publicKey;

      console.log("Creating token with mint address:", mintAddress.toString());

      // Get the minimum lamports needed for the mint
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Create a transaction to create account for the mint
      const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintAddress,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Sign the transaction with both the payer and the mint keypair
      createAccountTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      createAccountTransaction.feePayer = publicKey;

      // Get the signed transaction from the wallet
      const signedTransaction = await signTransaction(createAccountTransaction);

      // Also sign with the mint keypair
      signedTransaction.partialSign(mintKeypair);

      // Send the signed transaction
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(txid);

      // Initialize the mint
      await createMint(
        connection,
        {
          publicKey: publicKey,
          signTransaction,
        },
        publicKey, // mint authority
        publicKey, // freeze authority (you can set to null if you don't want a freeze authority)
        decimals,
        mintKeypair // pass the mint keypair here
      );

      console.log("Token created successfully!");

      setResult({
        success: true,
        message: `Token "${name}" (${symbol}) created successfully!`,
        mintAddress: mintAddress.toString(),
      });
    } catch (error) {
      console.error("Error creating token:", error);
      setResult({
        success: false,
        message: "Failed to create token. See console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Token</h2>
      <div style={styles.form}>
        <input
          type="text"
          placeholder="Token Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Decimals"
          value={decimals}
          onChange={(e) => setDecimals(Number(e.target.value))}
          style={styles.input}
        />
        <button
          onClick={handleCreateToken}
          style={loading ? styles.buttonDisabled : styles.button}
          disabled={loading || !publicKey}
        >
          {loading ? "Creating..." : "Create Token"}
        </button>
      </div>

      {result && (
        <div
          style={result.success ? styles.successMessage : styles.errorMessage}
        >
          <p>{result.message}</p>
          {result.success && (
            <div style={styles.mintAddressContainer}>
              <p style={styles.addressText}>
                Mint Address: {result.mintAddress}
              </p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(result.mintAddress)
                }
                style={styles.copyButton}
              >
                Copy Address
              </button>
              <p style={styles.savePrompt}>
                Save this mint address! You'll need it to mint, transfer, or
                check balances.
              </p>
            </div>
          )}
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
  addressText: {
    fontFamily: "monospace",
    wordBreak: "break-all",
    marginTop: "5px",
  },
  mintAddressContainer: {
    marginTop: "10px",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "4px",
    border: "1px dashed #ced4da",
  },
  copyButton: {
    marginTop: "5px",
    padding: "5px 10px",
    backgroundColor: "#e9ecef",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    cursor: "pointer",
  },
  savePrompt: {
    fontStyle: "italic",
    fontSize: "14px",
    marginTop: "10px",
    color: "#dc3545",
  },
};

export default CreateToken;
