import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCoffeeContext } from '../context/CoffeeContext';
import StarRating from '../components/StarRating';
import { Brew, totalWaterAmount } from '../types/Brew';
import { formatLocalDateTime } from '../utils/date';
import TagList from '../components/TagList';

const BrewDetails: React.FC = () => {
  const { brewId } = useParams<{ brewId?: string }>()
  const navigate = useNavigate();
  const { brews, deleteBrew } = useCoffeeContext()
  const [brew, setBrew] = React.useState<Brew | undefined>(undefined)

  useEffect(() => {
    if (!brewId) return;
      const foundBrew = brews.find(brew => brew.id === Number(brewId))
      setBrew(foundBrew);
  } , [brewId, brews]);

  const handleDelete = async () => {
    if (!brewId) return;

    const confirmed = window.confirm('本当に削除しますか？');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/brews/${brewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete brew: ${response.statusText}`);
      }

      // 成功時に状態を更新し、リストページにリダイレクト
      deleteBrew(Number(brewId));
      navigate('/brews');
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました。再試行してください。');
    }
  };

  if (!brew) {
    return <div>読み込み中...</div>
  }

  const isPositive = (number: number | undefined) => number != null && number > 0;

  const handleTagClick = (tag: string) => {
    navigate(`/brews?tag=${encodeURIComponent(tag)}`); // タグでフィルタした豆一覧を表示
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">抽出ログ</h1>
      </div>
      <TagList tags={brew.tags || []} onTagClick={handleTagClick} />

      <div className="space-y-4 mt-2">
        <p><strong>日付:</strong> {formatLocalDateTime(brew.created_at)}</p>
        {brew.bean && (<p><strong>豆:</strong> <Link to={`/beans/${brew.bean_id}`} className="text-blue-500 hover:underline">{brew.bean?.name}</Link></p>)}
        {isPositive(brew.bean_amount) && (<p><strong>豆の量:</strong> {brew.bean_amount} [g]</p>)}
        {isPositive(brew.cups) && (<p><strong>カップ数:</strong> {brew.cups}</p>)}
        {brew.grind_size && (<p><strong>挽き具合:</strong> {brew.grind_size}</p>)}
        {isPositive(brew.water_temp) && (<p><strong>湯温:</strong> {brew.water_temp} [℃]</p>)}
        {isPositive(brew.bloom_water_amount) && (<p><strong>蒸らし湯量:</strong> {brew.bloom_water_amount} [ml]</p>)}
        {isPositive(brew.bloom_time) && (<p><strong>蒸らし時間:</strong> {brew.bloom_time} [秒]</p>)}

        {isPositive(brew.pours?.length) && (<div>
          <strong>注湯:</strong> (カッコ内は累計)
          <ul className="list-disc pl-5">
            {brew.pours?.map((pourAmount, index) => (
              <li key={index}>
                {index + 1}湯目: {pourAmount} ({totalWaterAmount(brew, index)}) [ml]
              </li>
            ))}
          </ul>
        </div>)}

        <div>
          <strong>総合評価:</strong>
          <StarRating rating={brew.overall_score ?? 0} onRatingChange={() => {}} />
        </div>
        <div>
          <strong>苦味:</strong>
          <StarRating rating={brew.bitterness ?? 0} onRatingChange={() => {}} />
        </div>
        <div>
          <strong>酸味:</strong>
          <StarRating rating={brew.acidity ?? 0} onRatingChange={() => {}} />
        </div>
        <div>
          <strong>甘味:</strong>
          <StarRating rating={brew.sweetness ?? 0} onRatingChange={() => {}} />
        </div>
        <p><strong>メモ:</strong> {brew.notes ?? ''}</p>
      </div>
      <div className="mt-4 py-2">
        <Link
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          to={`/brews/${brewId}/brews/new`}
        >
          これをベースに淹れる
        </Link>
      </div>
      <div className="mt-4 py-2">
        <Link
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          to={`/brews/${brewId}/edit`}
        >
          編集する
        </Link>
      </div>
      {brewId && (
        <div className="mt-4 py-2">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
          >
            削除する
          </button>
        </div>
      )}
      </div>
  );
};

export default BrewDetails;

