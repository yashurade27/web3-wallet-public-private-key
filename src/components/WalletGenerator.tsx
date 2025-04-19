import { useState, useEffect, SetStateAction } from "react";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import { toast } from "sonner";
import nacl from "tweetnacl";
import { ButtonEth, ButtonSol } from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import Heading from "./Heading";
import InputBox from "./InputBox";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Trash,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

interface Wallet {
  mnemonic: string;
  path: string;
  privateKey: string;
  publicKey: string;
}
const GenerateWallet = () => {
  const [refresh, setRefresh] = useState(false);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [pathTypes, setPathTypes] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [mnemonicInput, setMnemonicInput] = useState<string>("");
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
  const [gridView, setGridView] = useState<boolean>(false);
  const pathTypeNames: { [key: string]: string } = {
    "501": "Solana",
    "60": "Ethereum",
  };
  const pathTypeName = pathTypeNames[pathTypes[0]] || "";

  useEffect(() => {
    const storedWallets = localStorage.getItem("wallets");
    const storedPathTypes = localStorage.getItem("paths");
    const storedMnemonic = localStorage.getItem("mnemonics");
    if (storedMnemonic && storedPathTypes && storedWallets) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setPathTypes(JSON.parse(storedPathTypes));
      setWallets(JSON.parse(storedWallets));
      setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
    }
  }, []);

  const handleDeleteWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    setPathTypes(updatedPathTypes);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("paths", JSON.stringify(updatedPathTypes));
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
    toast.success("Wallet deleted successfully!");
  };

  const handleClearWallets = () => {
    setRefresh((r) => !r);
    localStorage.removeItem("wallets");
    localStorage.removeItem("mnemonics");
    localStorage.removeItem("paths");
    setShowMnemonic(false);
    setWallets([]);
    setMnemonicWords([]);
    setPathTypes([]);
    setVisiblePrivateKeys([]);
    setVisiblePhrases([]);
    toast.success("All wallets cleared.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const togglePrivateKeyVisibility = (index: number) => {
    setVisiblePrivateKeys(
      visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const generatWalletfromMnemonic = (
    pathType: string,
    mnemonic: string,
    accountIndex: number
  ) => {
    console.log("Generating wallet from mnemonic", { pathType, accountIndex });
    try {
      console.log("Creating seed buffer");
      const seedBuffer = mnemonicToSeedSync(mnemonic);
      console.log("Seed buffer created successfully", seedBuffer.length);

      const path =
        pathType === "501"
          ? `m/44'/${pathType}'/0'/${accountIndex}'`
          : `m/44'/${pathType}'/0'/${accountIndex}'`;

      console.log("Deriving path", path);

      const derivedResult = derivePath(path, seedBuffer.toString("hex"));
      console.log("Path derived successfully");
      const { key: derivedSeed } = derivedResult;

      let publicKeyEncoded;
      let privateKeyEncoded;

      if (pathType === "501") {
        console.log("Generating Solana wallet");
        // Solana
        const keypairData = nacl.sign.keyPair.fromSeed(derivedSeed);
        console.log("Nacl keypair created");
        const keypair = Keypair.fromSecretKey(keypairData.secretKey);
        console.log("Solana keypair created");

        privateKeyEncoded = bs58.encode(keypairData.secretKey);
        publicKeyEncoded = keypair.publicKey.toBase58();
        console.log("Solana keys encoded successfully");
      } else if (pathType === "60") {
        console.log("Generating Ethereum wallet");
        // Ethereum
        const privateKey = Buffer.from(derivedSeed).toString("hex");
        privateKeyEncoded = privateKey;

        const wallet = new ethers.Wallet(privateKey);
        publicKeyEncoded = wallet.address;
        console.log("Ethereum wallet created successfully");
      } else {
        console.error("Unsupported path type", pathType);
        toast.error("Unsupported path type.");
        return null;
      }

      console.log("Wallet generated successfully");
      return {
        publicKey: publicKeyEncoded,
        privateKey: privateKeyEncoded,
        mnemonic,
        path,
      };
    } catch (error: any) {
      console.error("Failed to generate wallet:", error);
      toast.error("Failed to generate wallet: " + error.message);
      return null;
    }
  };

  const debugLog = (step: any, data: any) => {
    console.log(`DEBUG [${step}]:`, data);
  };

  const handleGenerateWallets = () => {
    let mnemonic = mnemonicInput.trim();

    debugLog("Starting wallet generation", {
      mnemonic,
      pathType: pathTypes[0],
    });

    try {
      // Generate mnemonic if needed
      if (!mnemonic) {
        debugLog("Generating new mnemonic", null);
        try {
          mnemonic = generateMnemonic(128);
          debugLog("Generated mnemonic", mnemonic);
        } catch (error) {
          console.error("Mnemonic generation error:", error);
          toast.error(
            "Failed to generate mnemonic: " +
              (error instanceof Error
                ? error.message
                : "Unknown error occurred")
          );
          return;
        }
      } else if (!validateMnemonic(mnemonic)) {
        toast.error("Invalid mnemonic. Please enter a valid mnemonic.");
        return;
      }

      const words = mnemonic.split(" ");
      debugLog("Mnemonic words", words);

      // Create new wallet
      debugLog("Creating wallet with path", pathTypes[0]);
      try {
        const wallet = generatWalletfromMnemonic(
          pathTypes[0],
          mnemonic,
          wallets.length
        );

        debugLog("Wallet created", wallet ? "success" : "failed");

        if (wallet) {
          // Create updated arrays first
          const updatedWallets = [...wallets, wallet];
          const updatedPathTypes = [...pathTypes];
          const updatedVisibleKeys = [...visiblePrivateKeys, false];
          const updatedVisiblePhrases = [...visiblePhrases, false];

          // Update state
          debugLog("Updating state", {
            wordCount: words.length,
            walletCount: updatedWallets.length,
          });
          setMnemonicWords(words);
          setWallets(updatedWallets);
          setVisiblePrivateKeys(updatedVisibleKeys);
          setVisiblePhrases(updatedVisiblePhrases);

          // Update localStorage
          debugLog("Updating localStorage", null);
          localStorage.setItem("wallets", JSON.stringify(updatedWallets));
          localStorage.setItem("mnemonics", JSON.stringify(words));
          localStorage.setItem("paths", JSON.stringify(updatedPathTypes));

          toast.success("Wallet generated successfully!");
        } else {
          toast.error("Failed to generate wallet. Please try again.");
        }
      } catch (error) {
        console.error("Wallet creation error:", error);
        toast.error(
          `Error creating wallet: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    } catch (error) {
      console.error("Wallet generation failed:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  };

  const handleAddWallet = () => {
    if (!mnemonicWords || mnemonicWords.length === 0) {
      toast.error("Please generate a mnemonic first.");
      return;
    }
    const wallet = generatWalletfromMnemonic(
      pathTypes[0],
      mnemonicWords.join(" "),
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      const updatedPathTypes = [...pathTypes, pathTypes[0]];
      setWallets(updatedWallets);
      setPathTypes(updatedPathTypes);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      localStorage.setItem("paths", JSON.stringify(updatedPathTypes));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success("Wallet generated successfully!");
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {wallets.length === 0 && pathTypes.length === 0 && (
          <motion.div
            key="select-wallet"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Heading />
            <div className="flex justify-center mt-4 mb-4 gap-4">
              <ButtonEth
                onClick={() => {
                  setPathTypes(["60"]);
                  toast.success(
                    "Wallet selected. Please generate a wallet to continue."
                  );
                }}
              />
              <ButtonSol
                onClick={() => {
                  setPathTypes(["501"]);
                  toast.success(
                    "Wallet selected. Please generate a wallet to continue."
                  );
                }}
              />
            </div>
          </motion.div>
        )}

        {pathTypes.length !== 0 && (
          <motion.div
            key="show-recovery"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center mt-4 mb-4 gap-4"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-6xl font-black dark:text-white text-gray-800 flex flex-row gap-3">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {pathTypeName}
                </div>
                <div>Secret Recovery Phrase</div>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Save this phrase in a safe place. It is the only way to recover
                your wallet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-around items-center w-full max-w-4xl gap-8">
              <InputBox
                type="password"
                placeholder="Enter your mnemonic phrase here (or leave blank to generate)"
                value={mnemonicInput}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setMnemonicInput(e.target.value)
                }
              />
              <button
                onClick={handleGenerateWallets}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 
             dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Generate Wallet
              </button>
            </div>
          </motion.div>
        )}

        {refresh &&
          mnemonicWords &&
          mnemonicWords.length > 0 &&
          wallets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-primary/10 p-8 max-w-4xl mx-auto"
            >
              <div className="flex w-full justify-between items-center gap-6">
                <h2 className="text-3xl md:text-3xl font-bold tracking-lighter">
                  Your Secret Phrase
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  {showMnemonic ? (
                    <ChevronUp className="size-8" />
                  ) : (
                    <ChevronDown className="size-8" />
                  )}
                </button>
              </div>

              {showMnemonic && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col w-full items-center justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
                  >
                    {mnemonicWords.map((word, index) => (
                      <p
                        key={index}
                        className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4"
                      >
                        {word}
                      </p>
                    ))}
                  </motion.div>
                  <div
                    className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300 cursor-pointer"
                    onClick={() => copyToClipboard(mnemonicWords.join(" "))}
                  >
                    <Copy className="size-4" /> Click Here To Copy
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        {wallets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-8 mt-6 max-w-4xl mx-auto"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                Your Wallets
              </h2>
              <div className="flex gap-2">
                {wallets.length > 1 && (
                  <Button
                    variant={"ghost"}
                    onClick={() => setGridView(!gridView)}
                    className="hidden md:block"
                  >
                    {gridView ? <Grid2X2 /> : <List />}
                  </Button>
                )}
                <Button onClick={() => handleAddWallet()}>Add Wallet</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="self-end">
                      Clear Wallets
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete all wallets?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your wallets and keys from local storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleClearWallets()}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div>
              <div
                className={`grid gap-6 ${
                  gridView
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {wallets.map((wallet: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="flex flex-col rounded-2xl border border-primary/10"
                  >
                    <div className="flex justify-between px-8 py-6">
                      <h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
                        Wallet {index + 1}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex gap-2 items-center"
                          >
                            <Trash className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to delete this wallet?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your wallet and keys from local
                              storage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWallet(index)}
                              className="text-destructive"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
                      <div
                        className="flex flex-col w-full gap-2"
                        onClick={() => copyToClipboard(wallet.publicKey)}
                      >
                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                          Public Key
                        </span>
                        <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                          {wallet.publicKey}
                        </p>
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                          Private Key
                        </span>
                        <div className="flex justify-between w-full items-center gap-2">
                          <p
                            onClick={() => copyToClipboard(wallet.privateKey)}
                            className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                          >
                            {visiblePrivateKeys[index]
                              ? wallet.privateKey
                              : "•".repeat(wallet.privateKey.length)}{" "}
                            {/* Changed from wallet.mnemonic.length to wallet.privateKey.length */}
                          </p>
                          <Button
                            variant="ghost"
                            onClick={() => togglePrivateKeyVisibility(index)}
                          >
                            {visiblePrivateKeys[index] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GenerateWallet;
