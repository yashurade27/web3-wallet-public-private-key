export default function Heading() {
    return (
      <div className="text-center px-4">
        <h1 className="font-sans-serif mb-3 text-4xl font-extrabold leading-tight tracking-tight text-gray-800 md:text-5xl lg:text-6xl dark:text-white">
          Secure Your{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Web3 Identity
          </span>{" "}
          with{" "}
          <span className="font-mono font-extrabold *:text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">   
            Zer0Vault
          </span>
        </h1>
        <p className="text-md font-medium text-gray-600 lg:text-lg dark:text-gray-300">
          Generate, store & manage recovery phrases for Solana and Ethereum wallets — all in one secure vault.
        </p>
        <div className="font-sans-serif text-4xl font-thin text-gray-800 dark:text-white mt-16 mb-2">
            Choose your preferred network to get started
        </div>
      </div>
    );
  }
  