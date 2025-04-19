import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar({ isAirdrop }: { isAirdrop: (value: boolean) => void }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

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
                      className={`h-8 w-8 transition duration-300 ${
                        isDarkMode ? "invert" : ""
                      }`}
                    />
                    <h1 className="text-2xl font-mono text-gray-900 dark:text-white">
                      Zer0Vault
                    </h1>
                    <div>
                      <Badge
                        className="text-xs font-mono text-gray-900 dark:text-white rounded-full"
                        variant="outline"
                      >
                        v1.1
                      </Badge>
                    </div>
                  </div>
                  <p className="sr-only">Website Title</p>
                </a>
              </div>
              <div>
                <Button
                  id="airdrop-button"
                  onClick={() => {
                    isAirdrop(true)
                  }}
                  variant="ghost"
                  className="tracking-tight rounded-lg px-3 py-1.5 text-base font-semibold text-gray-700 dark:text-gray-200
               hover:bg-gray-100 dark:hover:bg-gray-800
               focus:outline-none focus:ring-0 border-none shadow-none gap-1 transition-colors"
                >
                  Devnet Faucet
                  <Badge variant="default" className="ml-1 rounded-2xl">
                    New
                  </Badge>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Toggle setIsDarkMode={setIsDarkMode} />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function Toggle({
  setIsDarkMode,
}: {
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isDark, setIsDark] = useState(false);
  const [modeLabel, setModeLabel] = useState("Dark Mode");

  function toggleDarkMode(checked: boolean) {
    document.documentElement.classList.toggle("dark", checked);

    if (checked) {
      localStorage.setItem("theme", "dark");
      setModeLabel("Light Mode");
    } else {
      localStorage.setItem("theme", "light");
      setModeLabel("Dark Mode");
    }

    setIsDarkMode(checked);
    setIsDark(checked);
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const isDarkPreferred =
      storedTheme === "dark" || (!storedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", isDarkPreferred);
    setIsDarkMode(isDarkPreferred);
    setIsDark(isDarkPreferred);
    setModeLabel(isDarkPreferred ? "Light Mode" : "Dark Mode");
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isDark}
        onCheckedChange={toggleDarkMode}
        className="bg-gray-900"
      />
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </span>
    </div>
  );
}
