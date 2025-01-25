import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';
import { Tag } from '../types/Tag';
import { useSession } from '@hono/auth-js/react';
import { useSettingsContext } from './SettingsContext'; // タグ情報を利用する

interface BrewContextProps {
  beans: Bean[];
  brews: Brew[];
  updateBean: (bean: Bean) => void;
  setBeans: (beans: Bean[]) => void;
  updateBrew: (brew: Brew) => void;
  setBrews: (brews: Brew[]) => void;
  refreshTags: () => void; // タグ関連データを再取得
}

const BrewContext = createContext<BrewContextProps | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beans, setBeansState] = useState<Bean[]>([]);
  const [brews, setBrewsState] = useState<Brew[]>([]);
  const { status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false); // 初期化済みフラグ
  const { tags } = useSettingsContext(); // SettingsContext からタグ情報を取得

  // beans または brews の再計算ロジック
  const updateBrewsWithBeansAndTags = (beans: Bean[], brews: Brew[], tags: Tag[]) => {
    const enrichedBeans = beans.map((bean) => ({
      ...bean,
      tags: tags.filter((tag) => bean.tagIds?.includes(Number(tag.id))), // tagIds でフィルタリング
    }));
    const enrichedBrews = brews.map((brew) => ({
      ...brew,
      tags: tags.filter((tag) => brew.tagIds?.includes(Number(tag.id))), // tagIds でフィルタリング
      bean: enrichedBeans.find((bean) => bean.id === brew.bean_id),
    }));
    return { enrichedBeans, enrichedBrews };
  };

  const setBeans = (newBeans: Bean[]) => {
    const { enrichedBeans, enrichedBrews } = updateBrewsWithBeansAndTags(newBeans, brews, tags);
    setBeansState(enrichedBeans);
    setBrewsState(enrichedBrews);
  };

  const setBrews = (newBrews: Brew[]) => {
    const { enrichedBeans, enrichedBrews } = updateBrewsWithBeansAndTags(beans, newBrews, tags);
    setBeansState(enrichedBeans);
    setBrewsState(enrichedBrews);
  };

  const refreshTags = () => {
    const { enrichedBeans, enrichedBrews } = updateBrewsWithBeansAndTags(beans, brews, tags);
    setBeansState(enrichedBeans);
    setBrewsState(enrichedBrews);
  };

  useEffect(() => {
    async function fetchBeansAndBrews() {
      const beansResponse = await fetch('/api/users/beans');
      const fetchedBeans: Bean[] = await beansResponse.json();

      const brewsResponse = await fetch('/api/users/brews');
      const fetchedBrews: Brew[] = await brewsResponse.json();

      const { enrichedBeans, enrichedBrews } = updateBrewsWithBeansAndTags(
        fetchedBeans,
        fetchedBrews,
        tags
      );
      setBeansState(enrichedBeans);
      setBrewsState(enrichedBrews);
    }

    if (status === 'authenticated' && !isInitialized) {
      fetchBeansAndBrews().then(() => setIsInitialized(true));
    }
  }, [status, isInitialized, tags]); // TODO タグの変更を監視するがAPIを再読み込みまでするか検討

  const updateBean = (bean: Bean) => {
    const updatedBeans = beans.map((b) => (b.id === bean.id ? bean : b));
    setBeans(updatedBeans);
  };

  const updateBrew = (brew: Brew) => {
    const updatedBrews = brews.map((b) => (b.id === brew.id ? brew : b));
    setBrews(updatedBrews);
  };

  return (
    <BrewContext.Provider
      value={{ beans, brews, updateBean, setBeans, updateBrew, setBrews, refreshTags }}
    >
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
