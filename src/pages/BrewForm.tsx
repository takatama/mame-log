import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';
import { useBrewContext } from '../context/BrewContext';
import StarRating from '../components/StarRating';

const BrewForm: React.FC = () => {
  const { beans, brews, updateBrew, setBrews } = useBrewContext();
  const { brewId, beanId, baseBrewId } = useParams<{ brewId?: string; beanId?: string; baseBrewId?: string }>();
  const [bean, setBean] = useState<any>(null);
  const [bean_amount, setBeanAmount] = useState(0);
  const [cups, setCups] = useState<number>(1);
  const [grind_size, setGrindSize] = useState('');
  const [water_temp, setWaterTemp] = useState(0);
  const [bloom_water_amount, setBloomWaterAmount] = useState(0);
  const [bloom_time, setBloomTime] = useState(0);
  const [pours, setPours] = useState<number[]>([]);
  const [brew_date, setBrewDate] = useState(new Date().toISOString().slice(0, 16)); // 現在の日時を初期値に設定
  const [overall_score, setOverallScore] = useState(0);
  const [bitterness, setBitterness] = useState(0);
  const [acidity, setAcidity] = useState(0);
  const [sweetness, setSweetness] = useState(0);
  const [notes, setNotes] = useState('');

  const setBrewParams = (brew: Brew) => {
    setBean(brew.bean);
    setCups(brew.cups);
    setBeanAmount(brew.bean_amount);
    setGrindSize(brew.grind_size);
    setWaterTemp(brew.water_temp);
    setBloomWaterAmount(brew.bloom_water_amount ?? 0);
    setBloomTime(brew.bloom_time ?? 0);
    setPours(brew.pours);
    setBrewDate(brew.brew_date);
    setOverallScore(brew.overall_score);
    setBitterness(brew.bitterness ?? 0);
    setAcidity(brew.acidity ?? 0);
    setSweetness(brew.sweetness ?? 0);
    setNotes(brew.notes ?? '');
  }

  useEffect(() => {
    if (brewId) {
      const selectedBrew = brews.find((b: Brew) => b.id === Number(brewId))
      if (selectedBrew) {
        setBrewParams(selectedBrew);
      }
    } else if (beanId) {
      const selectedBean = beans.find((b: Bean) => b.id === Number(beanId));
      setBean(selectedBean);
      setBrewDate(new Date().toISOString().slice(0, 16));
    } else if (baseBrewId) {
      const baseBrew = brews.find((b: Brew) => b.id === Number(baseBrewId));
      if (baseBrew) {
        setBrewParams(baseBrew);
        setBrewDate(new Date().toISOString().slice(0, 16));
      }
    }
  }, [brewId, beanId, baseBrewId, beans, brews]);

  const handleAddPour = () => {
    setPours([...pours, 0])
  };
  
  const handlePourChange = (index: number, value: number) => {
    const updatedPours = pours.map((pour, i) =>
      i === index ? value : pour
    );
    setPours(updatedPours);
  };

  const getBrewById = (brewId: number) => {
    return brews.find(brew => brew.id === brewId);
  }

  const navigate = useNavigate();

  const handlePost = async (newBrew: Brew) => {
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
  
  const handlePut = async (brewId: number, updatedBrew: Brew) => {
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
      cups,
      bean_amount,
      grind_size,
      water_temp,
      bloom_water_amount,
      bloom_time,
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
  
  const renderPresetButtons = <T extends string | number>(
    options: T[],
    selectedOption: T,
    setOption: (option: T) => void,
  ) => (
    <div className="flex space-x-4 py-2">
      {options.map((option) => (
        <button
          type='button'
          key={option}
          onClick={() => setOption(option)}
          className={`p-2 rounded-md w-1/${options.length} ${selectedOption === option ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const beanAmountOptions = (): number[] => {
    // 1 cups 10g がデフォルト
    // 2g刻みで5段階に増減できるようにする
    // 2 cups の場合は [16, 18, 20, 22, 24]
    return Array.from({ length: 5 }, (_, i) => cups * 10 + (i - 2) * 2);
  }

  const bloomAmountOptions = (): number[] => {
    // コーヒーの量の2倍がデフォルト
    // 5ml刻みで6段階に増減できるようにする
    // 20g の場合は [30, 35, 40, 45, 50, 55]
    return Array.from({ length: 6 }, (_, i) => bean_amount * 2 + (i - 2) * 5);
  }

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
          <label className="block text-sm font-medium">カップ数</label>
          {renderPresetButtons([1, 2, 3, 4], cups, setCups)}
        </div>
        <div>
          <label className="block text-sm font-medium">豆の量 (g)</label>
          {renderPresetButtons(beanAmountOptions(), bean_amount, setBeanAmount)}
        </div>
        <div>
          <label className="block text-sm font-medium">挽き具合</label>
          {renderPresetButtons(['極細', '細', '中細', '中', '粗'], grind_size, setGrindSize)}
        </div>
        <div>
          <label className="block text-sm font-medium">湯温 (℃)</label>
          {renderPresetButtons([80, 85, 90, 95], water_temp, setWaterTemp)}
        </div>
        <div>
          <label className="block text-sm font-medium">蒸らし湯量 (ml)</label>
          {renderPresetButtons(bloomAmountOptions(), bloom_water_amount, setBloomWaterAmount)}
        </div>
        <div>
          <label className="block text-sm font-medium">蒸らし時間 (秒)</label>
          {renderPresetButtons([30, 45, 60], bloom_time, setBloomTime)}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">注湯</label>
          {pours.map((pour: number, index: number) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium">{index + 1}湯目 (ml)</label>
                <input
                  type="number"
                  value={pour}
                  onChange={(e) => handlePourChange(index, Number(e.target.value))}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
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