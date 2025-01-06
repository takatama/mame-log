import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBrewContext } from '../context/BrewContext';

const BrewDetails: React.FC = () => {
  const { brews, beans } = useBrewContext()
  const { brewId } = useParams<{ brewId?: string }>()
  const brew = brews.find(brew => brew.id === brewId)
  if (!brew) {
    return <div>抽出ログが見つかりません。</div>
  }
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">抽出ログの詳細</h1>
      </div>

      <div className="space-y-4">
        <p><strong>日付:</strong> {brew.brewDate}</p>
        <p><strong>豆:</strong> {brew.bean.name}</p>
        <p><strong>豆の量:</strong> {brew.beanAmount}</p>
        <p><strong>カップ数:</strong> {brew.cups}</p>
        <p><strong>挽き具合:</strong> {brew.grindSize}</p>
        <p><strong>湯温:</strong> {brew.waterTemp}℃</p>

        <div>
          <strong>注湯:</strong>
          <ul className="list-disc pl-5">
            {brew.pours.map((pour) => (
              <li key={pour.index}>
                {pour.index + 1}回目: {pour.amount}ml, 流速: {pour.flowRate}, 時間: {pour.time}秒
              </li>
            ))}
          </ul>
        </div>

        <p><strong>総合評価:</strong> {brew.overallScore}</p>
        <p><strong>苦味:</strong> {brew.bitterness}</p>
        <p><strong>酸味:</strong> {brew.acidity}</p>
        <p><strong>甘味:</strong> {brew.sweetness}</p>
      </div>
      <div className="mt-4">
        <Link
          className="px-4 py-2 bg-blue-500 text-white rounded"
          to={`/brews/${brewId}/brews/new`}
        >
          これをベースに淹れる
        </Link>
      </div>
    </div>
  );
};

export default BrewDetails;

