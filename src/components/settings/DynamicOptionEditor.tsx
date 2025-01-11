import React from 'react';
import { DynamicBrewSettingOption } from '../../types/Brew';

interface DynamicOptionEditorProps {
  setting: DynamicBrewSettingOption<number | string>;
  onChange: (updatedSetting: DynamicBrewSettingOption<number | string>) => void;
}

const DynamicOptionEditor: React.FC<DynamicOptionEditorProps> = ({ setting, onChange }) => {
  const handleDynamicValueChange = (field: 'baseAmountPerCup' | 'stepSize' | 'numSteps', value: number) => {
    onChange({
      ...setting,
      [field]: value,
    });
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium">カップあたりの量</label>
        <input
          type="number"
          inputMode="numeric"
          value={setting.baseAmountPerCup || ''}
          onChange={(e) =>
            handleDynamicValueChange('baseAmountPerCup', Number(e.target.value))
          }
          className="block border rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">増減幅</label>
        <input
          type="string"
          inputMode="numeric"
          value={setting.stepSize || ''}
          onChange={(e) =>
            handleDynamicValueChange('stepSize', Number(e.target.value))
          }
          className="block border rounded-md p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">段階数</label>
        <input
          type="string"
          inputMode="numeric"
          value={setting.numSteps || ''}
          onChange={(e) =>
            handleDynamicValueChange('numSteps', Number(e.target.value))
          }
          className="block border rounded-md p-2 w-full"
        />
      </div>
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
    </>
  );
};

export default DynamicOptionEditor;
