import { createContext, useContext } from 'react';

export type ResponsiveContextValue = {
  isMobile: boolean;
};

export const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

export const useResponsive = (): ResponsiveContextValue => {
  const context = useContext(ResponsiveContext);

  if (context === null) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }

  return context;
};
