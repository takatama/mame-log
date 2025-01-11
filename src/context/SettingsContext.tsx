import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrewSettings, BrewSettingOption } from '../types/Brew';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';
import { isDynamicOption } from '../types/Brew';

const SettingsContext = createContext<{
  settings: BrewSettings;
  updateSettings: (newSettings: Partial<BrewSettings>) => void;
  saveSettings: () => void;
  loadSettings: () => void;
}>({
  settings: initialSettings,
  updateSettings: () => {},
  saveSettings: () => {},
  loadSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrewSettings>(initialSettings);

  const updateSettings = (newSettings: Partial<BrewSettings>) => {
    setSettings((prev) => {
      const updatedSettings: BrewSettings = { ...prev };
      Object.entries(newSettings).forEach(([key, value]) => {
        if (value) {
          updatedSettings[key] = value as BrewSettingOption<any>;
        }
      });
      return updatedSettings;
    });
  };

  const saveSettings = async () => {
    console.log('save', settings)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }
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
  
      console.log('loadedSettings', loadedSettings)
      console.log('updatedSettings', updatedSettings);
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

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};