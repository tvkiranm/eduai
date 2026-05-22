"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "eduai-theme";

type ThemeName = "default" | "aurora";

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;

  if (theme === "aurora") {
    root.dataset.theme = "aurora";
  } else {
    delete root.dataset.theme;
  }
}

function readStoredTheme(): ThemeName {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "aurora" ? "aurora" : "default";
}

export function ThemeToggle() {
  React.useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);

  function toggle() {
    const current: ThemeName =
      document.documentElement.dataset.theme === "aurora" ? "aurora" : "default";
    const next: ThemeName = current === "aurora" ? "default" : "aurora";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Switch theme"
      title="Switch theme"
    >
      <Palette className="h-4 w-4" />
    </Button>
  );
}
