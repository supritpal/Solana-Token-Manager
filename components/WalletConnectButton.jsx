// src/components/WalletConnectButton.jsx
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnectButton = ({ wallet }) => {
  return (
    <div>
      <h3>Your Wallet Address:</h3>
      <p>{wallet.publicKey ? wallet.publicKey.toBase58() : "Not Connected"}</p>
      {wallet.publicKey && (
        <button
          onClick={() =>
            navigator.clipboard.writeText(wallet.publicKey.toBase58())
          }
        >
          Copy Wallet Address
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    margin: "20px 0",
  },
  connectedText: {
    color: "#4caf50",
    fontWeight: "bold",
    margin: "5px 0",
  },
};

export default WalletConnectButton;
