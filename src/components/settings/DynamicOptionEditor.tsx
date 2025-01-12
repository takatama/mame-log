import React from 'react';
import { DynamicBrewSettingOption, generateOptions } from '../../types/Settings';

interface DynamicOptionEditorProps {
  setting: DynamicBrewSettingOption<number | string>;
  onChange: (updatedSetting: DynamicBrewSettingOption<number | string>) => void;
  previewCups: number;
}

const DynamicOptionEditor: React.FC<DynamicOptionEditorProps> = ({ setting, onChange, previewCups }) => {
  const handleDynamicValueChange = (field: 'baseAmountPerCup' | 'stepSize' | 'numSteps' | 'offset', value: number) => {
    onChange({
      ...setting,
      [field]: value,
    });
  };

  return (
    <>
      <div className="mb-2">
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
      <div className="mb-2">
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
      <div className="mb-2">
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
      <div className="mb-2">
        <label className="block text-sm font-medium">調整値</label>
        <input
          type="string"
          inputMode="numeric"
          value={setting.offset || 0}
          onChange={(e) =>
            handleDynamicValueChange('offset', Number(e.target.value))
          }
          className="block border rounded-md p-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label className="text-sm font-medium">{previewCups}カップの場合の選択肢</label>
        <div className="p-2 border rounded-md bg-gray-50">
          {generateOptions(setting, previewCups).map((option, index) => (
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
