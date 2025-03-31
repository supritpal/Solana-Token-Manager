import { Link } from "react-router-dom";
import WalletConnectButton from "./WalletConnectButton";

const Home = () => {
  return (
    <div>
      <h1>Solana Token Manager</h1>
      <WalletConnectButton />
      <Link to="/create-token">
        <button>Create Token</button>
      </Link>
      <Link to="/mint-token">
        <button>Mint Token</button>
      </Link>
      <Link to="/transfer-token">
        <button>Transfer Token</button>
      </Link>
    </div>
  );
};

export default Home;
