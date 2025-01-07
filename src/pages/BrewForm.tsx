import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bean } from '../types/Bean';
import { Brew, Pour } from '../types/Brew';
import { useBrewContext } from '../context/BrewContext';
import StarRating from '../components/StarRating';

const BrewForm: React.FC = () => {
  const { beans, brews, updateBrew, setBrews } = useBrewContext();
  const { brewId, beanId } = useParams<{ brewId?: string; beanId?: string }>();
  const [bean, setBean] = useState<any>(null);
  const [bean_amount, setBeanAmount] = useState(0);
  const [cups, setCups] = useState(0);
  const [grind_size, setGrindSize] = useState('');
  const [water_temp, setWaterTemp] = useState(0);
  const [pours, setPours] = useState<Pour[]>([{ idx: 0, amount: 0, flow_rate: '', time: 0 }]);
  const [brew_date, setBrewDate] = useState(new Date().toISOString().slice(0, 16)); // 現在の日時を初期値に設定
  const [overall_score, setOverallScore] = useState(0);
  const [bitterness, setBitterness] = useState(0);
  const [acidity, setAcidity] = useState(0);
  const [sweetness, setSweetness] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (brewId) {
      const selectedBrew = brews.find((b: Brew) => b.id === Number(brewId))
      if (selectedBrew) {
        setBean(selectedBrew.bean);
        setBeanAmount(selectedBrew.bean_amount);
        setCups(selectedBrew.cups);
        setGrindSize(selectedBrew.grind_size);
        setWaterTemp(selectedBrew.water_temp);
        setPours(selectedBrew.pours);
        setBrewDate(new Date(selectedBrew.brew_date).toISOString().slice(0, 16));
        setOverallScore(selectedBrew.overall_score);
        setBitterness(selectedBrew.bitterness ?? 0);
        setAcidity(selectedBrew.acidity ?? 0);
        setSweetness(selectedBrew.sweetness ?? 0);
        setNotes(selectedBrew.notes ?? '');
      }
    } else if (beanId) {
      const selectedBean = beans.find((b: Bean) => b.id === Number(beanId));
      setBean(selectedBean);
    }
  }, [brewId, beanId, beans, brews]);

  const handleAddPour = () => {
    setPours([...pours, { idx: pours.length, amount: 0, flow_rate: '', time: 0 }]);
  };

  const handlePourChange = (index: number, field: string, value: string | number) => {
    const updatedPours = pours.map((pour: any, i: number) =>
      i === index ? { ...pour, [field]: value } : pour
    );
    setPours(updatedPours);
  };

  const getBrewById = (brewId: number) => {
    return brews.find(brew => brew.id === brewId);
  }

  const navigate = useNavigate();

  const handlePost = async (newBrew: any) => {
    try {  
      const response = await fetch('/api/brews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrew),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create brew: ${response.statusText}`);
      }
  
      const createdBrew: Brew = await response.json();
      setBrews([...brews, createdBrew]);
      navigate(`/brews/${createdBrew.id}`);
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the brew. Please try again.');
    }
  };
  
  const handlePut = async (brewId: number, updatedBrew: any) => {
    const previousBrew = getBrewById(brewId); // 現在の状態を取得

    try {
      // 楽観的に状態を更新
      updateBrew(updatedBrew);
      navigate(`/brews/${brewId}`);

      const response = await fetch(`/api/brews/${brewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBrew),
      });
  
      if (!response.ok) {
        if (previousBrew) updateBrew(previousBrew); // エラー時に元の状態を復元
        throw new Error(`Failed to update brew: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      if (previousBrew) updateBrew(previousBrew); // エラー時に元の状態を復元
      alert('An error occurred while updating the brew. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newBrew = {
      id: Number(brewId) || Date.now(), // POST時に一時IDを使用
      bean,
      bean_id: bean.id,
      bean_amount,
      cups,
      grind_size,
      water_temp,
      pours,
      brew_date,
      overall_score,
      bitterness,
      acidity,
      sweetness,
      notes,
    };
    
    if (brewId) {
      await handlePut(Number(brewId), newBrew);
    } else {
      await handlePost(newBrew);
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">新しい抽出ログを作成</h1> */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">抽出日時</label>
          <input
            type="datetime-local"
            value={brew_date}
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
            value={bean_amount}
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
            value={grind_size}
            onChange={(e) => setGrindSize(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">湯温 (℃)</label>
          <input
            type="number"
            value={water_temp}
            onChange={(e) => setWaterTemp(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>

        {/* 注湯詳細 */}
        <div>
          <label className="block text-sm font-medium mb-2">注湯詳細</label>
          {pours.map((pour: any, index: number) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium">注湯 {pour.idx + 1} - 湯量 (ml)</label>
                <input
                  type="number"
                  value={pour.amount}
                  onChange={(e) => handlePourChange(index, 'amount', Number(e.target.value))}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">流速</label>
                <input
                  type="text"
                  value={pour.flow_rate}
                  onChange={(e) => handlePourChange(index, 'flow_rate', e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">時間 (秒)</label>
                <input
                  type="text"
                  value={pour.time}
                  onChange={(e) => handlePourChange(index, 'time', Number(e.target.value))}
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
                  削除する
                </button>
                )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPour}
            className="mt-2 bg-green-500 text-white p-2 rounded-md"
          >
            注湯を追加する
          </button>
        </div>

        {/* 評価 */}
        <div>
          <label className="block text-sm font-medium">総合評価</label>
          <StarRating rating={overall_score} onRatingChange={setOverallScore} />
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          保存する
        </button>
      </form>
    </div>
  );
};

export default BrewForm;