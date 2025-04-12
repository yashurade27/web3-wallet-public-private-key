const buttonStyles = `
  py-3 px-6 me-2 mb-2 text-xl font-light
  rounded-3xl border transition-colors duration-200
  bg-gray-900 text-white border-gray-800
  hover:bg-gray-800 hover:text-blue-300
  dark:bg-white dark:text-gray-900 dark:border-gray-200
  dark:hover:bg-gray-100 dark:hover:text-blue-700
`;

export function ButtonEth({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={onClick} type="button" className={`${buttonStyles} min-w-[120px]`}>
        Ethereum
      </button>
    </div>
  );
}

export function ButtonSol({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={onClick} type="button" className={`${buttonStyles} min-w-[120px]`}>
        Solana
      </button>
    </div>
  );
}
