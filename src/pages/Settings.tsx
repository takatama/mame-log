import React, { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsContext();
  const [localSettings, setLocalSettings] = useState(settings);

  // 固定選択肢を編集
  const handleFixedOptionChange = (key: string, index: number, value: string) => {
    const updatedOptions = [...(localSettings[key].fixedOptions || [])];
    updatedOptions[index] = value;
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        fixedOptions: updatedOptions,
      },
    });
  };

  // 固定選択肢を追加
  const handleAddFixedOption = (key: string) => {
    const updatedOptions = [...(localSettings[key].fixedOptions || []), ''];
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        fixedOptions: updatedOptions,
      },
    });
  };

  // 固定選択肢を削除
  const handleDeleteFixedOption = (key: string, index: number) => {
    const updatedOptions = (localSettings[key].fixedOptions || []).filter(
      (_, i) => i !== index
    );
    setLocalSettings({
      ...localSettings,
      [key]: {
        ...localSettings[key],
        fixedOptions: updatedOptions,
      },
    });
  };

  // 動的値を編集
  const handleDynamicValueChange = (key: string, field: 'baseAmountPerCup' | 'stepSize' | 'numSteps', value: number) => {
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
            <h2 className="text-xl font-semibold mb-2">{setting.displayName} {setting.unitLabel ? `[${setting.unitLabel}]` : ""}</h2>
            {setting.fixedOptions ? (
              <>
                {/* <p className="text-sm text-gray-600">固定の選択肢を編集</p> */}
                {setting.fixedOptions.map((option, index) => (
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
                    value={setting.baseAmountPerCup || ''}
                    onChange={(e) =>
                      handleDynamicValueChange(key, 'baseAmountPerCup', Number(e.target.value))
                    }
                    className="block border rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">増減幅</label>
                  <input
                    type="number"
                    value={setting.stepSize || ''}
                    onChange={(e) =>
                      handleDynamicValueChange(key, 'stepSize', Number(e.target.value))
                    }
                    className="block border rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">段階数</label>
                  <input
                    type="number"
                    value={setting.numSteps || ''}
                    onChange={(e) =>
                      handleDynamicValueChange(key, 'numSteps', Number(e.target.value))
                    }
                    className="block border rounded-md p-2 w-full"
                  />
                </div>
                {/* プレビュー */}
                {setting.dynamicOptions && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">1カップの場合の選択肢</h4>
                    <div className="mt-2 p-2 border rounded-md bg-gray-50">
                      {setting.baseAmountPerCup &&
                        setting.stepSize &&
                        setting.numSteps &&
                        setting.dynamicOptions(
                          1,
                          setting.baseAmountPerCup,
                          setting.stepSize,
                          setting.numSteps
                        ).map((option, index) => (
                          <span
                            key={index}
                            className="text-center p-1 bg-blue-100 rounded-md m-1"
                          >
                            {option}
                          </span>
                        )
                        )}
                    </div>
                  </div>
                )}
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
