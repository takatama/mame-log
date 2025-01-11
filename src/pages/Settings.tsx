import React from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { isFixedOption, isDynamicOption } from '../types/Brew';
import FixedOptionEditor from '../components/settings/FixedOptionEditor';
import DynamicOptionEditor from '../components/settings/DynamicOptionEditor';

const Settings: React.FC = () => {
  const { settings, updateSettings, saveSettings, loadSettings } = useSettingsContext();

  const handleSave = async () => {
    const sanitizedSettings = Object.entries(settings).reduce((acc, [key, setting]) => {
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
    }, {} as typeof settings);

    await saveSettings(sanitizedSettings);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">設定を変更</h1>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {Object.entries(settings).map(([key, setting]) => (
          <div key={key} className="mb-6 border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{setting.displayName} {setting.unitLabel ? `[${setting.unitLabel}]` : ""}</h2>
            {isFixedOption(setting) && (
              <FixedOptionEditor
                setting={setting}
                onChange={(newSetting) => updateSettings(key, newSetting)}
              />
            )}
            {isDynamicOption(setting) && (
              <DynamicOptionEditor
                key={key}
                setting={setting}
                onChange={(newSetting) => updateSettings(key, newSetting)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          設定を保存する
        </button>
        <button
          type="button"
          onClick={loadSettings}
          className="bg-gray-500 text-white p-2 rounded-md ml-2"
        >
          設定を読み込む
        </button>
      </form>
    </div>
  );
};

export default Settings;