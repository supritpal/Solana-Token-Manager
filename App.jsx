import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CreateToken from "./components/CreateToken";
import MintToken from "./components/MintToken";
import TransferToken from "./components/TransferToken";
import CheckBalance from "./components/CheckBalance";
import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { connected } = useWallet();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Solana Token Manager</h1>

      {/* Wallet Connection Button */}
      <div style={styles.walletButtonContainer}>
        <WalletMultiButton />
      </div>

      {connected ? (
        <>
          {/* Tab Buttons */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab("create")}
              style={activeTab === "create" ? styles.activeTab : styles.tab}
            >
              Create Token
            </button>
            <button
              onClick={() => setActiveTab("mint")}
              style={activeTab === "mint" ? styles.activeTab : styles.tab}
            >
              Mint Token
            </button>
            <button
              onClick={() => setActiveTab("transfer")}
              style={activeTab === "transfer" ? styles.activeTab : styles.tab}
            >
              Transfer Token
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              style={activeTab === "balance" ? styles.activeTab : styles.tab}
            >
              Check Balance
            </button>
          </div>

          {/* Render Components Based on Active Tab */}
          <div style={styles.content}>
            {activeTab === "create" && <CreateToken />}
            {activeTab === "mint" && <MintToken />}
            {activeTab === "transfer" && <TransferToken />}
            {activeTab === "balance" && <CheckBalance />}
          </div>
        </>
      ) : (
        <div style={styles.connectPrompt}>
          <p>Please connect your wallet to access token management features.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f9",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "20px auto",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  walletButtonContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  connectPrompt: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    margin: "20px 0",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  tab: {
    padding: "10px",
    backgroundColor: "#ddd",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  activeTab: {
    padding: "10px",
    backgroundColor: "#6a0dad",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  content: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  },
};

export default App;
