import "./App.css";
import Navbar from "./components/Navbar";
import GenerateWallet from "./components/WalletGenerator";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <Navbar />

      <Toaster position="bottom-right" richColors />
      <div className="pt-32 md:pt-40 flex flex-col items-center justify-center">
        <GenerateWallet />
      </div>
    </div>
  );
}

export default App;
