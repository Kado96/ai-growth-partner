import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuoteContextType {
  isOpen: boolean;
  openQuote: (serviceId?: string) => void;
  closeQuote: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openQuote = () => {
    setIsOpen(true);
  };

  const closeQuote = () => {
    setIsOpen(false);
  };

  return (
    <QuoteContext.Provider value={{ isOpen, openQuote, closeQuote }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
};
