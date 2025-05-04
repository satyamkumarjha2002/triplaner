"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  [key: string]: any;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force light theme without allowing any changes
  return (
    <NextThemesProvider 
      forcedTheme="light" 
      attribute="class" 
      enableSystem={false} 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 