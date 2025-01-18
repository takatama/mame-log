import React from 'react';
import { Tag } from '../types/Tag';

type TagListProps = {
  tags: Tag[];
  onTagClick?: (tagName: string) => void; // タグクリック時のコールバック（任意）
};

const TagList: React.FC<TagListProps> = ({ tags, onTagClick }) => {
  if (tags.length === 0) {
    return null; // タグがない場合は何も表示しない
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.name}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200"
          onClick={() => onTagClick?.(tag.name)}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
};

export default TagList;
