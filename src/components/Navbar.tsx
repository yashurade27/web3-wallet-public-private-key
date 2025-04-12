import React from "react";

export default function Navbar() {
  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-screen-md border border-gray-100 bg-white/80 py-6 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg dark:bg-gray-900/80 dark:border-gray-700">
        <div className="px-4">
          <div className="flex flex-col items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex shrink-0">
                <a aria-current="page" className="flex items-center" href="/">
                  <div className="flex items-center gap-4">
                    <img
                      src="/blockchain.svg"
                      alt="Blockchain Logo"
                      className="h-8 w-8 transition duration-300 dark:invert"
                    />
                    <h1 className="text-2xl font-mono text-gray-900 dark:text-white">
                      Zer0Vault
                    </h1>
                  </div>
                  <p className="sr-only">Website Title</p>
                </a>
              </div>
              <div className="hidden md:flex md:items-center md:gap-5">
                <a
                  className="rounded-lg px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-200 dark:hover:bg-gray-800"
                  href="https://solana.com/developers/courses/intro-to-solana/intro-to-cryptography"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  How it works
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Toggle />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function Toggle() {
  const [modeLabel, setModeLabel] = React.useState("Dark Mode");

  function toggleDarkMode(event: React.ChangeEvent<HTMLInputElement>) {
    const isDark = event.target.checked;

    const toggleTrack = event.target.nextElementSibling as HTMLElement;
    const toggleDot = toggleTrack?.nextElementSibling as HTMLElement;

    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setModeLabel("Light Mode");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setModeLabel("Dark Mode");
    }

    // Optional styling transitions
    toggleTrack?.classList.toggle("bg-blue-500", isDark);
    toggleTrack?.classList.toggle("shadow-neumorphic-toggle-inset", isDark);
    toggleTrack?.classList.toggle("shadow-neumorphic-toggle-outset", !isDark);
    toggleDot?.classList.toggle("translate-x-6", isDark);
  }

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);

    // Set toggle state and label
    const checkbox = document.getElementById("toggle") as HTMLInputElement;
    if (checkbox) checkbox.checked = isDark;

    setModeLabel(isDark ? "Light Mode" : "Dark Mode");
  }, []);

  return (
    <div className="flex items-center">
      <span className="mr-3 text-gray-600 dark:text-white">{modeLabel}</span>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            id="toggle"
            className="sr-only"
            onChange={toggleDarkMode}
          />
          <div className="w-12 h-6 bg-gray-300 rounded-full shadow-neumorphic-toggle-outset transition dark:bg-gray-600" />
          <div className="absolute top-0 left-0 w-6 h-6 bg-white dark:bg-gray-300 rounded-full shadow-md transform transition duration-300 ease-in-out" />
        </div>
      </label>
    </div>
  );
}
