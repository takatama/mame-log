import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrewSettings, isDynamicOption, isFixedOption } from '../types/Brew';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';

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
  const [settings, setSettings] = useState<BrewSettings>(initialSettings);

  const updateSettings = (key: string, newSetting: BrewSettings[keyof BrewSettings]) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: newSetting,
    }));
  };

  const saveSettings = async (newSettings: BrewSettings) => {
    try {
      const response = await fetch('/api/settings', {
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
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.statusText}`);
      }
      const loadedSettings: Partial<BrewSettings> = await response.json();
      const updatedSettings: BrewSettings = { ...initialSettings };

      Object.keys(initialSettings).forEach((key) => {
        const settingKey = key as keyof BrewSettings;
        if (loadedSettings[settingKey] !== undefined) {
          updatedSettings[settingKey] = loadedSettings[settingKey]!;
        }
        if (isDynamicOption(updatedSettings[settingKey]) && isDynamicOption(initialSettings[settingKey])) {
          updatedSettings[settingKey].dynamicOptions = initialSettings[settingKey].dynamicOptions;
        }
      });

      setSettings(updatedSettings);
    } catch (error) {
      console.error(error);
      alert('設定の読み込み中にエラーが発生しました。再試行してください。');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => useContext(SettingsContext);