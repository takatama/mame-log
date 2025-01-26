import React, { createContext, useState, ReactNode, useEffect, useContext, use } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';
import { Tag } from '../types/Tag';
import { useSession } from '@hono/auth-js/react';

interface CoffeeContextProps {
  beans: Bean[];
  createBean: (bean: Bean) => void;
  updateBean: (bean: Bean) => void;
  deleteBean: (beanId: number) => void;
  brews: Brew[];
  createBrew: (brew: Brew) => void;
  updateBrew: (brew: Brew) => void;
  deleteBrew: (brewId: number) => void;
  tags: Tag[];
  // setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  setTags: (tags: Tag[]) => void;
}

const CoffeeContext = createContext<CoffeeContextProps | undefined>(undefined);

export const CoffeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [beans, setLocalBeans] = useState<Bean[]>([]);
  const [brews, setLocalBrews] = useState<Brew[]>([]);
  const [tags, setLocalTags] = useState<Tag[]>([]);
  
  const updateBeansWithTags = (beans: Bean[], tags: Tag[]) => {
    return beans.map((bean) => ({
      ...bean,
      tags: bean.tags
        ?.map((tag) => tags.find((t) => t.id === tag.id))
        .filter((t) => t !== undefined) as Tag[], // 有効なタグのみを保持
    }));
  };

  const updateBrewsWithBeansAndTags = (beans: Bean[], brews: Brew[], tags: Tag[]) => {
    return brews.map((brew) => ({
      ...brew,
      bean: beans.find((bean) => bean.id === brew.bean_id),
      tags: brew.tags
        ?.map((tag) => tags.find((t) => t.id === tag.id))
        .filter((t) => t !== undefined) as Tag[], // 有効なタグのみを保持
    }));
  };

  const setBeans = (newBeans: Bean[]) => {
    const updatedBeans = updateBeansWithTags(newBeans, tags);
    setLocalBeans(updatedBeans);
    setLocalBrews((currentBrews) =>
      updateBrewsWithBeansAndTags(updatedBeans, currentBrews, tags)
    );
  };

  const setBrews = (newBrews: Brew[]) => {
    setLocalBrews(updateBrewsWithBeansAndTags(beans, newBrews, tags));
  };

  const setTags = (newTags: Tag[]) => {
    setLocalTags(newTags);
    const updatedBeans = updateBeansWithTags(beans, newTags);
    setLocalBeans(updatedBeans);
    setLocalBrews(updateBrewsWithBeansAndTags(updatedBeans, brews, newTags));
  };

  useEffect(() => {
    async function fetchBeansBrewsAndTags() {
      const tagsResponse = await fetch('/api/users/tags');
      const fetchedTags: Tag[] = await tagsResponse.json();
      setLocalTags(fetchedTags);

      const beansResponse = await fetch('/api/users/beans');
      const fetchedBeans: Bean[] = await beansResponse.json();
      const updatedBeans = updateBeansWithTags(fetchedBeans, fetchedTags);
      setLocalBeans(updatedBeans);

      const brewsResponse = await fetch('/api/users/brews');
      const fetchedBrews: Brew[] = await brewsResponse.json();
      setLocalBrews(updateBrewsWithBeansAndTags(updatedBeans, fetchedBrews, fetchedTags));
    }

    if (status === 'authenticated' && !isInitialized) {
      fetchBeansBrewsAndTags().then(() => setIsInitialized(true));
    }
  }, [status, isInitialized]);

  const addNewTags = (partialTags: Tag[]) => {
    const currentTagIds = tags.map(tag => tag.id);
    const newTags = partialTags.filter(tag => !currentTagIds.includes(tag.id));
    setLocalTags([...tags, ...newTags]);
  };

  const createBean = (bean: Bean) => {
    // タグが新規作成されている場合がある
    addNewTags(bean.tags);
    setLocalBeans([...beans, bean]);
  }

  const updateBean = (bean: Bean) => {
    // タグが新規作成されている場合がある
    addNewTags(bean.tags);
    const updatedBeans = beans.map((b) => (b.id === bean.id ? bean : b));
    setLocalBeans(updatedBeans);
  };

  const deleteBean = (beanId: number) => {
    setBeans(beans.filter((bean) => bean.id !== beanId));
  }

  const createBrew = (brew: Brew) => {
    // タグが新規作成されている場合がある
    addNewTags(brew.tags);
    setLocalBrews([...brews, brew]);
  }

  const updateBrew = (brew: Brew) => {
    // タグが新規作成されている場合がある
    addNewTags(brew.tags);
    const updatedBrews = brews.map((b) => (b.id === brew.id ? brew : b));
    setLocalBrews(updatedBrews);
  };

  const deleteBrew = (brewId: number) => {
    setLocalBrews(brews.filter((brew) => brew.id !== brewId));
  }

  return (
    <CoffeeContext.Provider
      value={{ beans, updateBean, createBean, deleteBean, brews, createBrew, updateBrew, deleteBrew, tags, setTags }}
    >
      {children}
    </CoffeeContext.Provider>
  );
};

export const useCoffeeContext = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useBrewContext must be used within a BrewProvider');
  }
  return context;
};