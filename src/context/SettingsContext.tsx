import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrewSettings } from '../types/Brew';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';
import { isDynamicOption } from '../types/Brew';
import { isFixedOption } from '../types/Brew';

const SettingsContext = createContext<{
  settings: BrewSettings;
  saveSettings: (newSettings: BrewSettings) => void;
  loadSettings: () => void;
}>({
  settings: initialSettings,
  saveSettings: () => {},
  loadSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrewSettings>(initialSettings);

  const saveSettings = async (newSettings: BrewSettings) => {
    const sanitizedSettings = Object.entries(newSettings).reduce((acc, [key, setting]) => {
      acc[key] = {
        ...setting,
        ...(isFixedOption(setting) && {
          fixedOptions: setting.fixedOptions
            ?.flatMap((option) => {
              if (typeof option !== 'string') return option;
              const trimmed = option.trim();
              return trimmed ? trimmed : [];
            }) as (string | number)[] || undefined,
        }),
      };
      return acc;
    }, {} as typeof newSettings);

    setSettings(sanitizedSettings);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedSettings),
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
    <SettingsContext.Provider value={{ settings, saveSettings, loadSettings }}>
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