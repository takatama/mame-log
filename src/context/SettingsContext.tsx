import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrewSettings } from '../types/Settings';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';
import { useSession } from '@hono/auth-js/react';
import { Tag } from '../types/Tag';

interface SettingsContextProps {
  settings: BrewSettings;
  updateSettings: (key: string, newSetting: BrewSettings[keyof BrewSettings]) => void;
  saveSettings: (newSettings: BrewSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
  tags: Tag[];
  setTags: (newTags: Tag[]) => void;
}

const SettingsContext = createContext<SettingsContextProps>({
  settings: initialSettings,
  updateSettings: () => {},
  saveSettings: async () => {},
  loadSettings: async () => {},
  tags: [],
  setTags: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useSession();
  const [settings, setSettings] = useState<BrewSettings>(initialSettings);
  const [isInitialized, setIsInitialized] = useState(false); // 初期化済みフラグ
  const [tags, setTags] = useState<Tag[]>([]);

  const updateSettings = (key: string, newSetting: BrewSettings[keyof BrewSettings]) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: newSetting,
    }));
  };

  const saveSettings = async (newSettings: BrewSettings) => {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }
      setSettings(newSettings);
      alert('設定が保存されました！');
    } catch (error) {
      console.error(error);
      alert('設定の保存中にエラーが発生しました。再試行してください。');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/users/settings');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.statusText}`);
      }
      // データベースに空の設定が保存される可能性があるため、デフォルト設定をベースにする
      const loadedSettings: Partial<BrewSettings> = await response.json();
      const updatedSettings: BrewSettings = { ...initialSettings };

      Object.keys(initialSettings).forEach((key) => {
        const settingKey = key as keyof BrewSettings;
        if (loadedSettings[settingKey] !== undefined) {
          updatedSettings[settingKey] = loadedSettings[settingKey]!;
        }
      });

      setSettings(updatedSettings);
    } catch (error) {
      console.error(error);
      alert('設定の読み込み中にエラーが発生しました。再試行してください。');
    }
  };

  const loadTags = async () => {
    const response = await fetch('/api/users/tags');
    if (!response.ok) {
      throw new Error(`Failed to load tags: ${response.statusText}`);
    }
    const currentTags = await response.json() as Tag[];
    setTags(currentTags);
  }

  useEffect(() => {
    if (status === 'authenticated' && !isInitialized) {
      loadSettings().then(() => loadTags()).then(() => setIsInitialized(true));
    }
  }, [status, isInitialized]);
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, loadSettings, tags, setTags }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => useContext(SettingsContext);
