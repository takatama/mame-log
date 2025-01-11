import React, { createContext, useContext, useState } from 'react';
import { BrewSettings, BrewSettingOption } from '../types/Brew';
import { DefaultBrewSettings as initialSettings } from '../settings/DefaultBrewSettings';

const SettingsContext = createContext<{
  settings: BrewSettings;
  updateSettings: (newSettings: Partial<BrewSettings>) => void;
}>({
  settings: initialSettings,
  updateSettings: () => {},
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

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useBrewContext must be used within a BrewProvider');
  }
  return context;
}