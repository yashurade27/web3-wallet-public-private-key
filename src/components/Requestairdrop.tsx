import { motion } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Requestairdrop() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div className="items-center justify-center">
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <AirdropContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </div>
  );
}

function AirdropContent() {
  const wallet = useWallet();
  const { connection } = useConnection();

  async function getbalance() {
    if (wallet.publicKey) {
      const balance = await connection.getBalance(wallet.publicKey);
      const balanceElement = document.getElementById("balance");
      if (balanceElement) {
        balanceElement.innerHTML = (balance / LAMPORTS_PER_SOL).toFixed(4);
      }
    }
  }

  useEffect(() => {
    if (wallet.connected) {
      getbalance();
    }
  }, [wallet.connected, wallet.publicKey]);

  async function requestairdrop() {
    const amountElement = document.getElementById("amount");
    const amount = amountElement
      ? (amountElement as HTMLInputElement).value
      : "";

    if (!wallet.publicKey) {
      toast.error("Wallet not connected. Please connect your wallet.");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        parseFloat(amount) * LAMPORTS_PER_SOL
      );
      toast.success("Airdrop requested successfully!");

      await connection.confirmTransaction(signature, "confirmed");
      toast.success("Airdrop confirmed!");
      getbalance();
    } catch (error) {
      console.error("Airdrop error:", error);
      toast.error("Failed to request airdrop. Please try again.");
    }
  }

  return (
    <motion.div
      key="request-airdrop"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex items-center justify-center px-4"
    >
      <Card className="w-full max-w-xl p-6 rounded-2xl bg-white/80 dark:bg-black/30 backdrop-blur-md shadow-xl border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white">
        <CardHeader>
          <div className="flex flex-col gap-5 ">
            <CardTitle className="text-gray-900 dark:text-white">
              {wallet.publicKey ? "Airdrop SOL" : "Connect Your Wallet"}
            </CardTitle>

            <CardDescription className="text-gray-700 dark:text-gray-300">
              Airdrop yourself Devnet SOL for testing and development on the
              Solana blockchain.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between gap-6">
            <WalletMultiButton />
            <WalletDisconnectButton />
          </div>
          <div className="flex flex-col gap-4 mt-10">
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in SOL"
            />
            <Button onClick={requestairdrop}>Request Airdrop</Button>
          </div>
          <div className="mt-12 text-xl font-semibold text-gray-600 dark:text-white">
            SOL Balance:{" "}
            <span className="font-light" id="balance">
              Null
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-900 dark:text-gray-400">
            Devnet only
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
