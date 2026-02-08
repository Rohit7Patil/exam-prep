"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-md border bg-background p-2 sm:p-1.5 text-foreground transition hover:bg-muted"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
      ) : (
        <Moon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
      )}
    </button>
  );
}
