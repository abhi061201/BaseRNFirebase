import React, { createContext, useContext, ReactNode } from 'react';
import { Theme, ThemeMode } from './types';
import { themes } from './themes';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: themeMode = 'primary',
}) => {
  const value: ThemeContextType = {
    theme: themes[themeMode],
    themeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

