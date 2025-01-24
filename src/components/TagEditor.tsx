import React from 'react';
import OptionEditor from './OptionEditor';
import { Tag } from '../types/Tag';

interface TagEditorProps {
  tags: Tag[];
  onTagsChange: (updatedTags: Tag[]) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, onTagsChange }) => {
  return (
    <div>
      <OptionEditor
        options={tags}
        onOptionsChange={onTagsChange} // 親に変更をそのまま通知
        addOption={() => ({ id: undefined, name: '' })}
        valueAccessor={(tag) => tag.name}
        onChangeAccessor={(tag, value) => ({ ...tag, name: value.toString() })}
      />
    </div>
  );
};

export default TagEditor;
