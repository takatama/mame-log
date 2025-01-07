import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';

interface BrewContextProps {
  beans: Bean[];
  brews: Brew[];
  updateBean: (bean: Bean) => void;
  setBeans: (beans: Bean[]) => void;
  updateBrew: (brew: Brew) => void;
  setBrews: (brews: Brew[]) => void;
}

const BrewContext = createContext<BrewContextProps | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beans, setBeansState] = useState<Bean[]>([]);
  const [brews, setBrewsState] = useState<Brew[]>([]);

  // beans または brews の再計算ロジック
  const updateBrewsWithBeans = (beans: Bean[], brews: Brew[]) => {
    return brews
      .map((brew) => ({
        ...brew,
        bean: beans.find((bean) => bean.id === brew.bean_id),
      }))
      .filter((brew) => brew.bean !== undefined)
      .sort((a, b) => a.brew_date.localeCompare(b.brew_date)) as Brew[];
  };

  const setBeans = (newBeans: Bean[]) => {
    setBeansState(newBeans);
    setBrewsState((currentBrews) => updateBrewsWithBeans(newBeans, currentBrews));
    beans.sort((a, b) => a.purchase_date.localeCompare(b.purchase_date));
  };

  const setBrews = (newBrews: Brew[]) => {
    setBrewsState(updateBrewsWithBeans(beans, newBrews));
  };

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
    <BrewContext.Provider value={{ beans, brews, updateBean, setBeans, updateBrew, setBrews }}>
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