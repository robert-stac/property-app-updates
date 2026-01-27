import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  rate: number; // 1 USD = X UGX
  loading: boolean;
  convertToUsd: (ugx: number) => number;
  formatUsd: (amount: number) => string;
  formatUgx: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rate, setRate] = useState<number>(3700); // Fallback default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live rate from free API
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data.rates && data.rates.UGX) {
          setRate(data.rates.UGX);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  const convertToUsd = (ugx: number) => ugx / rate;

  const formatUsd = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatUgx = (amount: number) => 
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount);

  return (
    <CurrencyContext.Provider value={{ rate, loading, convertToUsd, formatUsd, formatUgx }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};