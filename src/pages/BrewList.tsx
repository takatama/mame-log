import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBrewContext } from '../context/BrewContext';
import { Brew } from '../types/Brew';
import { formatLocalDateTime } from '../utils/date';
import TagList from '../components/TagList';

interface BrewListItemProps {
  brew: Brew;
}

export const BrewListItem: React.FC<BrewListItemProps> = ({ brew }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/brews?tag=${encodeURIComponent(tag)}`); // タグでフィルタした豆一覧を表示
  };

  return (
    <li key={brew.id} className="p-4 border rounded-md">
      <Link to={`/brews/${brew.id}`} className="text-blue-500 hover:underline">
        <h2 className="font-bold">{formatLocalDateTime(brew.created_at)}</h2>
        <p>豆: {brew.bean?.name}</p>
        
        <div className="my-2">
          <TagList tags={brew.tags || []} onTagClick={handleTagClick} />
        </div>
        {(brew.overall_score != null && brew.overall_score > 0) && (<p>評価: {'★'.repeat(brew.overall_score ?? 0)}</p>)}
      </Link>
    </li>
  );
}

const BrewList: React.FC = () => {
  const { brews } = useBrewContext()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">抽出ログ一覧</h1>
      <ul className="space-y-4 mt-4">
        {brews.map((brew) => (
          <BrewListItem key={brew.id} brew={brew} />
        ))}
      </ul>
      {/* 新しく淹れるボタン */}
      <div className="mt-4 py-4">
        <Link
          to="/brews/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          新しく淹れる
        </Link>
      </div>
    </div>
  );
};

export default BrewList;
