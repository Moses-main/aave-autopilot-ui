import * as React from 'react';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}
