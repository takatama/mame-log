import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';

interface BrewContextProps {
  beans: Bean[];
  brews: Brew[];
}

const BrewContext = createContext<BrewContextProps | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);

  useEffect(() => {
    async function fetchBeansAndBrews() {
      const beansResponse = await fetch('/beans');
      const beans: Bean[] = await beansResponse.json();
      setBeans(beans);

      const brewsResponse = await fetch('/brews');
      const brews: any = await brewsResponse.json();
      const updatedBrews: Brew[] = brews.map((brew: any) => ({
        ...brew,
        bean: beans.find((bean) => bean.id === brew.bean_id),
      }));
      setBrews(updatedBrews);
    }

    fetchBeansAndBrews();
  }, []);

  return (
    <BrewContext.Provider value={{ beans, brews }}>
      {children}
    </BrewContext.Provider>
  );
};

export const useBrewContext = () => {
  const context = useContext(BrewContext);
  if (!context) {
    throw new Error('useBrewContext must be used within a BrewProvider');
  }
  return context;
};