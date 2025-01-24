import React from 'react';
import OptionEditor from './OptionEditor';
import { FixedBrewSettingOption } from '../types/Settings';

interface FixedOptionEditorProps {
  setting: FixedBrewSettingOption<number | string>;
  onChange: (updatedSetting: FixedBrewSettingOption<number | string>) => void;
}

const FixedOptionEditor: React.FC<FixedOptionEditorProps> = ({ setting, onChange }) => {
  const handleOptionsChange = (updatedOptions: (number | string)[]) => {
    onChange({
      ...setting,
      fixedOptions: updatedOptions,
    });
  };

  return (
    <OptionEditor
      options={setting.fixedOptions || []}
      onOptionsChange={handleOptionsChange}
      isNumeric={setting.isNumeric}
    />
  );
};

export default FixedOptionEditor;
