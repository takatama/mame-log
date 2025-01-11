import React, { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsContext();
  const [localSettings, setLocalSettings] = useState(settings);

  // 固定選択肢を編集
  const handleFixedOptionChange = (key: string, index: number, value: string) => {
    const updatedOptions = [...(localSettings[key].options || [])];
    updatedOptions[index] = value;
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        options: updatedOptions,
      },
    });
  };

  // 固定選択肢を追加
  const handleAddFixedOption = (key: string) => {
    const updatedOptions = [...(localSettings[key].options || []), ''];
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        options: updatedOptions,
      },
    });
  };

  // 固定選択肢を削除
  const handleDeleteFixedOption = (key: string, index: number) => {
    const updatedOptions = (localSettings[key].options || []).filter(
      (_, i) => i !== index
    );
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        options: updatedOptions,
      },
    });
  };

  // 動的値を編集
  const handleDynamicValueChange = (key: string, field: 'amountPerCup' | 'step', value: number) => {
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        [field]: value,
      },
    });
  };

  // 保存処理
  const handleSave = () => {
    updateSettings(localSettings);
    alert('設定が保存されました！');
    console.log(localSettings, settings);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">設定を変更</h1>
      <form className="space-y-6">
        {Object.entries(localSettings).map(([key, setting]) => (
          <div key={key} className="mb-6 border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{setting.label} {setting.unit ? `[${setting.unit}]` : ""}</h2>
            {setting.options ? (
              <>
                {/* <p className="text-sm text-gray-600">固定の選択肢を編集</p> */}
                {setting.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleFixedOptionChange(key, index, e.target.value)
                      }
                      className="block border rounded-md p-2 w-3/4"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteFixedOption(key, index)}
                      className="bg-red-500 text-white p-2 rounded-md w-1/4"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddFixedOption(key)}
                  className="bg-green-500 text-white p-2 rounded-md"
                >
                  選択肢を追加
                </button>
              </>
            ) : (
              <>
                {/* <p className="text-sm text-gray-600">動的な値を編集</p> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium">カップあたりの量</label>
                  <input
                    type="number"
                    value={setting.amountPerCup || ''}
                    onChange={(e) =>
                      handleDynamicValueChange(key, 'amountPerCup', Number(e.target.value))
                    }
                    className="block border rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">増減幅</label>
                  <input
                    type="number"
                    value={setting.step || ''}
                    onChange={(e) =>
                      handleDynamicValueChange(key, 'step', Number(e.target.value))
                    }
                    className="block border rounded-md p-2 w-full"
                  />
                </div>
              </>
            )}
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
