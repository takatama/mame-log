import React, { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { isFixedOption, isDynamicOption } from '../types/Brew';
import FixedOptionEditor from '../components/settings/FixedOptionEditor';
import DynamicOptionEditor from '../components/settings/DynamicOptionEditor';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsContext();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    const sanitizedSettings = Object.entries(localSettings).reduce((acc, [key, setting]) => {
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
    }, {} as typeof localSettings);
    setLocalSettings(sanitizedSettings);
    updateSettings(sanitizedSettings);
    alert("設定が保存されました！");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">設定を変更</h1>
      <form className="space-y-6">
        {Object.entries(localSettings).map(([key, setting]) => (
          <div key={key} className="mb-6 border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{setting.displayName} {setting.unitLabel ? `[${setting.unitLabel}]` : ""}</h2>
            {isFixedOption(setting) ? (
              <FixedOptionEditor
                key={key}
                setting={setting}
                onChange={(updatedSetting) => setLocalSettings({
                  ...localSettings,
                  [key]: updatedSetting,
                })}
              />
            ) : isDynamicOption(setting) ? (
              <DynamicOptionEditor
                key={key}
                setting={setting}
                onChange={(updatedSetting) => setLocalSettings({
                  ...localSettings,
                  [key]: updatedSetting,
                })}
              />
            ) : null }
          </div>
        ))}
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          保存する
        </button>
      </form>
    </div>
  );
};

export default Settings;
