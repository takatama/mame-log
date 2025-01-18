import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrewSettings } from '../types/Settings';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';
import { useAuth } from './AuthContext'; // 認証状態を確認する

interface SettingsContextProps {
  settings: BrewSettings;
  updateSettings: (key: string, newSetting: BrewSettings[keyof BrewSettings]) => void;
  saveSettings: (newSettings: BrewSettings) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextProps>({
  settings: initialSettings,
  updateSettings: () => {},
  saveSettings: async () => {},
  loadSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isRegistered } = useAuth(); // 認証状態を確認
  const [settings, setSettings] = useState<BrewSettings>(initialSettings);
  const [isInitialized, setIsInitialized] = useState(false); // 初期化済みフラグ

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

  useEffect(() => {
    if (isSignedIn && isRegistered && !isInitialized) {
      loadSettings().then(() => setIsInitialized(true));
    }
  }, [isSignedIn, isRegistered, isInitialized]);
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => useContext(SettingsContext);
