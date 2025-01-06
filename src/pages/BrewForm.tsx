import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bean, Beans } from '../types/Bean';
import StarRating from '../components/StarRating';

const BrewForm: React.FC<Beans> = ({ beans }) => {
  const location = useLocation();
  const [brew, setBrew] = useState<any>(null);
  const [bean, setBean] = useState<any>(null);
  const [beanAmount, setBeanAmount] = useState(0);
  const [cups, setCups] = useState(0);
  const [grindSize, setGrindSize] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [pours, setPours] = useState([{ index: 0, amount: 0, flowRate: '', time: 0 }]);
  const [brewDate, setBrewDate] = useState(new Date().toISOString().slice(0, 16)); // 現在の日時を初期値に設定
  const [overallScore, setOverallScore] = useState(0);
  const [bitterness, setBitterness] = useState(0);
  const [acidity, setAcidity] = useState(0);
  const [sweetness, setSweetness] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (location.state?.brew) {
      const brew = location.state.brew;
      setBrew(brew);
      setBean(brew.bean);
      setBeanAmount(brew.beanAmount);
      setCups(brew.cups);
      setGrindSize(brew.grindSize);
      setWaterTemp(brew.waterTemp);
      setPours(brew.pours);
      setBrewDate(new Date(brew.brewDate).toISOString().slice(0, 16));
      setOverallScore(brew.overallScore);
      setBitterness(brew.bitterness);
      setAcidity(brew.acidity);
      setSweetness(brew.sweetness);
      setNotes(brew.notes);
    }
  }, [location.state]);

  const handleAddPour = () => {
    setPours([...pours, { index: pours.length, amount: 0, flowRate: '', time: 0 }]);
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
      beanId: bean.id,
      beanAmount,
      cups,
      grindSize,
      waterTemp,
      pours,
      brewDate,
      overallScore,
      bitterness,
      acidity,
      sweetness,
      notes
    };
    console.log(newBrew);
    // APIリクエストでデータを保存する処理をここに追加
  };

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">新しい抽出ログを作成</h1> */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
        {/* コーヒー豆の選択 */}
        <div>
          <label className="block text-sm font-medium">コーヒー豆</label>
          <select
            value={bean?.id || ''}
            onChange={(e) => {
              const selectedBean = beans.find((b: Bean) => b.id === Number(e.target.value));
              setBean(selectedBean);
            }}
            className="mt-1 block w-full border rounded-md p-2"
            required
          >
            <option value="" disabled>コーヒー豆を選択してください</option>
            {beans.map((bean: Bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name}
              </option>
            ))}
          </select>
        </div>

        {/* 抽出設定 */}
        <div>
          <label className="block text-sm font-medium">豆の量 (g)</label>
          <input
            type="number"
            value={beanAmount}
            onChange={(e) => setBeanAmount(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">カップ数</label>
          <input
            type="number"
            value={cups}
            onChange={(e) => setCups(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
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

        {/* 注湯詳細 */}
        <div>
          <label className="block text-sm font-medium mb-2">注湯詳細</label>
          {pours.map((pour: any, index: number) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium">注湯 {pour.index + 1} - 湯量 (ml)</label>
                <input
                  type="number"
                  value={pour.amount}
                  onChange={(e) => handlePourChange(index, 'amount', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">流速</label>
                <input
                  type="text"
                  value={pour.flowRate}
                  onChange={(e) => handlePourChange(index, 'flowRate', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">時間 (秒)</label>
                <input
                  type="text"
                  value={pour.time}
                  onChange={(e) => handlePourChange(index, 'time', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
                {index === pours.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                  const updatedPours = pours.filter((_, i) => i !== index);
                  setPours(updatedPours);
                  }}
                  className="mt-2 bg-red-500 text-white p-2 rounded-md"
                >
                  削除
                </button>
                )}
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

        {/* 評価 */}
        <div>
          <label className="block text-sm font-medium">総合評価</label>
          <StarRating rating={overallScore} onRatingChange={setOverallScore} />
        </div>
        <div>
          <label className="block text-sm font-medium">苦味</label>
          <StarRating rating={bitterness} onRatingChange={setBitterness} />
        </div>
        <div>
          <label className="block text-sm font-medium">酸味</label>
          <StarRating rating={acidity} onRatingChange={setAcidity} />
        </div>
        <div>
          <label className="block text-sm font-medium">甘味</label>
          <StarRating rating={sweetness} onRatingChange={setSweetness} />
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        {/* 保存ボタン */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          保存
        </button>
      </form>
    </div>
  );
};

export default BrewForm;