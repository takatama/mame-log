import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brew } from '../types/Brew';
import { formatLocalDateTime } from '../utils/date';
import { useCoffeeContext } from '../context/CoffeeContext';
import TagList from '../components/TagList';

interface BrewListItemProps {
  brew: Brew;
}

export const BrewListItem: React.FC<BrewListItemProps> = ({ brew }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/brews?tag=${encodeURIComponent(tag)}`); // タグでフィルタした抽出ログ一覧を表示
  };

  return (
    <li key={brew.id} className="p-4 border rounded-md">
      <Link to={`/brews/${brew.id}`} className="text-blue-500 hover:underline">
        <h2 className="font-bold">{formatLocalDateTime(brew.created_at)}</h2>
        <p>豆: {brew.bean?.name}</p>
        {brew.overall_score != null && brew.overall_score > 0 && (
          <p>評価: {'★'.repeat(brew.overall_score ?? 0)}</p>
        )}
      </Link>
      <div className="my-2">
        <TagList tags={brew.tags || []} onTagClick={handleTagClick} />
      </div>
    </li>
  );
};

const BrewList: React.FC = () => {
  const { brews } = useCoffeeContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFilter = searchParams.get('tag'); // クエリパラメータ 'tag' を取得

  // フィルタリング
  const filteredBrews = tagFilter
    ? brews.filter((brew) => brew.tags.some((tag) => tag.name === tagFilter))
    : brews;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">
        {tagFilter ? `タグ: ${tagFilter} の抽出ログ` : '抽出ログ一覧'}
      </h1>
      <ul className="space-y-4 mt-4">
        {filteredBrews.map((brew) => (
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
