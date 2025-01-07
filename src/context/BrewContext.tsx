import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';

interface BrewContextProps {
  beans: Bean[];
  brews: Brew[];
  updateBean: (bean: Bean) => void;
  updateBrew: (brew: Brew) => void;
  setBeans: (beans: Bean[]) => void;
}

const BrewContext = createContext<BrewContextProps | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);

  useEffect(() => {
    async function fetchBeansAndBrews() {
      const beansResponse = await fetch('/api/beans');
      const beans: Bean[] = await beansResponse.json();
      setBeans(beans);

      const brewsResponse = await fetch('/api/brews');
      const brews: any = await brewsResponse.json();
      const updatedBrews: Brew[] = brews.map((brew: any) => ({
        ...brew,
        bean: beans.find((bean) => bean.id === brew.bean_id),
      }));
      setBrews(updatedBrews);
    }

    fetchBeansAndBrews();
  }, []);

  const updateBean = (bean: Bean) => {
    const updatedBeans = beans.map((b) => (b.id === bean.id ? bean : b));
    setBeans(updatedBeans);
  };

  const updateBrew = (brew: Brew) => {
    const updatedBrews = brews.map((b) => (b.id === brew.id ? brew : b));
    setBrews(updatedBrews);
  };

  return (
    <BrewContext.Provider value={{ beans, brews, updateBean, setBeans, updateBrew }}>
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