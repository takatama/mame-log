import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brew } from '../types/Brew';

const BrewDetail: React.FC<{ brew: Brew }> = ({ brew }) => {
  const navigate = useNavigate();
  const handleCopyBrew = () => {
    // データを引き継いでNewBrewに遷移
    navigate('/brews/new', { state: { brew } });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">抽出ログの詳細</h1>
        {/* これをベースに淹れるボタン */}
        <button
          onClick={handleCopyBrew}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          これをベースに淹れる
        </button>
      </div>

      <div className="space-y-4">
        <p><strong>日付:</strong> {brew.brewDate}</p>
        <p><strong>コーヒー豆:</strong> {brew.bean.name}</p>
        <p><strong>挽き具合:</strong> {brew.grindSize}</p>
        <p><strong>湯温:</strong> {brew.waterTemp}℃</p>
        <p><strong>蒸らし時間:</strong> {brew.bloomTime}秒</p>
        <p><strong>蒸らし湯量:</strong> {brew.bloomWater}ml</p>

        <div>
          <strong>注湯情報:</strong>
          <ul className="list-disc pl-5">
            {brew.pours.map((pour) => (
              <li key={pour.pourNumber}>
                {pour.pourNumber}回目: {pour.amount}ml, 流速: {pour.flowRate}ml/s
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrewDetail;

