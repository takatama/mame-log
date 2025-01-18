import React, { useState } from 'react';

type TagManagerProps = {
  tags: string[]; // 現在のタグリスト
  onAdd: (tag: string) => void; // タグ追加時の処理
  onRemove: (tag: string) => void; // タグ削除時の処理
  tagSuggestions?: string[]; // タグ候補（オプション）
};

const TagManager: React.FC<TagManagerProps> = ({ tags, onAdd, onRemove, tagSuggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onAdd(newTag);
      setInputValue('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">タグ</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-300 px-2 py-1 rounded-full text-sm cursor-pointer"
            onClick={() => onRemove(tag)}
          >
            {tag} ×
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="タグを追加"
          className="block w-4/5 border rounded-md p-2"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="w-1/5 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          追加
        </button>
      </div>
      {tagSuggestions.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-medium mb-1">タグ候補</h3>
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm cursor-pointer"
                // bg-gray-200 px-2 py-1 rounded-full text-sm cursor-pointer
                onClick={() => {
                  if (!tags.includes(suggestion)) onAdd(suggestion);
                }}
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
