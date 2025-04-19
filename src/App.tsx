import "./App.css";
import Navbar from "./components/Navbar";
import GenerateWallet from "./components/WalletGenerator";
import { Toaster } from "sonner";
import Footer from "./components/Footer";
import { useState } from "react";
import Requestairdrop from "./components/Requestairdrop";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const [airdrop, setShowAirdrop] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300 flex flex-col">
      <Navbar isAirdrop={setShowAirdrop} />
      <Toaster position="bottom-right" richColors />
      <div className="flex flex-col flex-1">
        {airdrop == false && (
          <div className="pt-32 md:pt-40 flex flex-col items-center justify-center flex-1">
            <GenerateWallet />
          </div>
        )}
        {airdrop == true && (
          <div className="pt-32 md:pt-40 flex flex-col items-center justify-center flex-1">
            <Requestairdrop />
          </div>
        )}
      </div>
      <div >
        <Footer />
      </div>
    </div>
  );
}

export default App;
