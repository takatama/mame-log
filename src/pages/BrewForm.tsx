import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const NewBrew: React.FC = () => {
  const location = useLocation();
  const [brew, setBrew] = useState<any>(null);

  const [beanId, setBeanId] = useState(brew?.beanId || '');
  const [grindSize, setGrindSize] = useState(brew?.grindSize || '');
  const [waterTemp, setWaterTemp] = useState(brew?.waterTemp || '');
  const [bloomTime, setBloomTime] = useState(brew?.bloomTime || '');
  const [bloomWater, setBloomWater] = useState(brew?.bloomWater || '');
  const [pours, setPours] = useState(brew?.pours || [{ pourNumber: 1, amount: '', flowRate: '' }]);
  const [brewDate, setBrewDate] = useState(new Date().toISOString().slice(0, 16)); // 現在の日時を初期値に設定

  useEffect(() => {
    if (location.state?.brew) {
      setBrew(location.state.brew);
    }
  }, [location.state]);

  const handleAddPour = () => {
    setPours([...pours, { pourNumber: pours.length + 1, amount: '', flowRate: '' }]);
  };

  const handlePourChange = (index: number, field: string, value: string) => {
    const updatedPours = pours.map((pour: any, i: number) =>
      i === index ? { ...pour, [field]: value } : pour
    );
    setPours(updatedPours);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBrew = {
      beanId,
      grindSize,
      waterTemp,
      bloomTime,
      bloomWater,
      brewDate,
      pours,
    };
    console.log(newBrew);
    // APIリクエストでデータを保存する処理をここに追加
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新しい抽出ログを作成</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* コーヒー豆の選択 */}
        <div>
          <label className="block text-sm font-medium">コーヒー豆のID</label>
          <input
            type="text"
            value={beanId}
            onChange={(e) => setBeanId(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>

        {/* 抽出設定 */}
        <div>
          <label className="block text-sm font-medium">挽き具合</label>
          <input
            type="text"
            value={grindSize}
            onChange={(e) => setGrindSize(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">湯温 (℃)</label>
          <input
            type="number"
            value={waterTemp}
            onChange={(e) => setWaterTemp(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">蒸らし時間 (秒)</label>
          <input
            type="number"
            value={bloomTime}
            onChange={(e) => setBloomTime(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">蒸らし湯量 (ml)</label>
          <input
            type="number"
            value={bloomWater}
            onChange={(e) => setBloomWater(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">抽出日時</label>
          <input
            type="datetime-local"
            value={brewDate}
            onChange={(e) => setBrewDate(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>

        {/* 注湯詳細 */}
        <div>
          <label className="block text-sm font-medium mb-2">注湯詳細</label>
          {pours.map((pour: any, index: number) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium">注湯 {pour.pourNumber} - 湯量 (ml)</label>
                <input
                  type="number"
                  value={pour.amount}
                  onChange={(e) => handlePourChange(index, 'amount', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">流速 (ml/s)</label>
                <input
                  type="text"
                  value={pour.flowRate}
                  onChange={(e) => handlePourChange(index, 'flowRate', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPour}
            className="mt-2 bg-green-500 text-white p-2 rounded-md"
          >
            注湯を追加
          </button>
        </div>

        {/* 保存ボタン */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          保存
        </button>
      </form>
    </div>
  );
};

export default NewBrew;
