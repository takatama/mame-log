import React from 'react';
import { FixedBrewSettingOption } from '../../types/Brew';

interface FixedOptionEditorProps {
  setting: FixedBrewSettingOption<number | string>;
  onChange: (updatedSetting: FixedBrewSettingOption<number | string>) => void;
}

const FixedOptionEditor: React.FC<FixedOptionEditorProps> = ({ setting, onChange }) => {
  const handleFixedOptionChange = (index: number, value: string | number) => {
    const updatedOptions = [...(setting.fixedOptions || [])];
    updatedOptions[index] = value;
    onChange({
      ...setting,
      fixedOptions: updatedOptions,
    });
  };

  const handleAddFixedOption = () => {
    const updatedOptions = [...(setting.fixedOptions || []), ''];
    onChange({
      ...setting,
      fixedOptions: updatedOptions,
    });
  };

  const handleDeleteFixedOption = (index: number) => {
    const updatedOptions = (setting.fixedOptions || []).filter((_, i) => i !== index);
    onChange({
      ...setting,
      fixedOptions: updatedOptions,
    });
  };

  return (
    <>
      {setting.fixedOptions.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={option}
            inputMode={setting.isNumeric ? "numeric" : undefined}
            onChange={(e) =>
              handleFixedOptionChange(
                index,
                setting.isNumeric ? Number(e.target.value) : e.target.value
            )}
            className="block border rounded-md p-2 w-3/4"
          />
          <button
            type="button"
            onClick={() => handleDeleteFixedOption(index)}
            className="bg-red-500 text-white p-2 rounded-md w-1/4"
          >
            削除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddFixedOption}
        className="bg-green-500 text-white p-2 rounded-md"
      >
        選択肢を追加
      </button>
    </>
  );
};

export default FixedOptionEditor;
