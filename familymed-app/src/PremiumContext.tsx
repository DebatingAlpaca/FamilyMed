import React, { createContext, useCallback, useContext, useState } from 'react';
import PremiumModal from './components/PremiumModal';
import { Feature } from './premium';

type Ctx = { openPremium: (f?: Feature) => void };
const PremiumCtx = createContext<Ctx>({ openPremium: () => {} });
export const usePremium = () => useContext(PremiumCtx);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const openPremium = useCallback((f: Feature = 'welcome') => setFeature(f), []);
  return (
    <PremiumCtx.Provider value={{ openPremium }}>
      {children}
      <PremiumModal feature={feature} onClose={() => setFeature(null)} />
    </PremiumCtx.Provider>
  );
}
