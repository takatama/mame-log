import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';
import { useBrewContext } from '../context/BrewContext';
import StarRating from '../components/StarRating';
import { fromUtcToLocalDateTime, fromLocalToUtc } from '../utils/date';

const BrewForm: React.FC = () => {
  const { beans, brews, updateBrew, setBrews } = useBrewContext();
  const { brewId, beanId, baseBrewId } = useParams<{ brewId?: string; beanId?: string; baseBrewId?: string }>();
  const [bean, setBean] = useState<Bean | undefined>(undefined);
  const [brew, setBrew] = useState<Brew>({ brew_date: new Date().toISOString() });
  const [baseBrew, setBaseBrew] = useState<Brew>();

  useEffect(() => {
    if (brewId) {
      const selectedBrew = brews.find((b: Brew) => b.id === Number(brewId));
      if (!selectedBrew) return;
      setBean(selectedBrew.bean);
      setBrew(selectedBrew);
    } else if (beanId) {
      const selectedBean = beans.find((b: Bean) => b.id === Number(beanId));
      setBean(selectedBean);
    } else if (baseBrewId) {
      const baseBrew = brews.find((b: Brew) => b.id === Number(baseBrewId));
      if (!baseBrew) return;
      setBaseBrew(baseBrew);
      setBean(baseBrew.bean);
      // 新しく作るので日付をリセット
      setBrew({ ...baseBrew, brew_date: new Date().toISOString() });
    }
  }, [brewId, beanId, baseBrewId, beans, brews]);

  const handleAddPour = () => {
    setBrew({ ...brew, pours: [...(brew?.pours || []), 0] })
  };
  
  const handlePourChange = (index: number, value: number) => {
    const updatedPours = (brew?.pours ?? []).map((pour, i) =>
      i === index ? value : pour
    );
    setBrew({ ...brew, pours: updatedPours });
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
  
      const createdBrew: any = await response.json();
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
      bean_id: bean?.id,
      ...brew,
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
    property: keyof Brew
  ) => (
    <div className="flex space-x-4 py-2">
      {options.map((option) => (
        <button
          type='button'
          key={option}
          onClick={() => setBrew({ ...brew, [property]: option })}
          className={`p-2 rounded-md flex-1 w-1/${options.length} ${selectedOption === option ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
    return Array.from({ length: 5 }, (_, i) => (brew?.cups ?? 1) * 10 + (i - 2) * 2);
  }

  const bloomAmountOptions = (): number[] => {
    // コーヒーの量の2倍がデフォルト
    // 5ml刻みで6段階に増減できるようにする
    // 20g の場合は [30, 35, 40, 45, 50, 55]
    return Array.from({ length: 6 }, (_, i) => (brew?.bean_amount ?? 20) * 2 + (i - 2) * 5);
  }

  if (!brew) return <div>読み込み中...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">新しい抽出ログを作成</h1> */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">抽出日時</label>
          <input
            type="datetime-local"
            value={fromUtcToLocalDateTime(brew.brew_date)}
            onChange={(e) => setBrew({ ...brew, brew_date: fromLocalToUtc(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        {baseBrew && (
          <label className="block text-sm font-medium">(カッコ内は前回の選択)</label>
        )}
        <div>
          <label className="block text-sm font-medium">コーヒー豆 { baseBrew?.bean ? `(${baseBrew.bean?.name})` : '' }</label>

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
          <label className="block text-sm font-medium">カップ数 { baseBrew ? `(${baseBrew.cups})` : '' }</label>
          {renderPresetButtons([1, 2, 3, 4], brew?.cups ?? 0, 'cups')}
        </div>
        <div>
          <label className="block text-sm font-medium">豆の量 [g] { baseBrew ? `(${baseBrew.bean_amount})` : '' }</label>
          {renderPresetButtons(beanAmountOptions(), brew?.bean_amount ?? '', 'bean_amount')}
        </div>
        <div>
          <label className="block text-sm font-medium">挽き具合 { baseBrew ? `(${baseBrew.grind_size})` : '' }</label>
          {renderPresetButtons(['極細', '細', '中細', '中', '粗'], brew?.grind_size ?? '', 'grind_size')}
        </div>
        <div>
          <label className="block text-sm font-medium">湯温 [℃] { baseBrew ? `(${baseBrew.water_temp})` : '' }</label>
          {renderPresetButtons([80, 85, 90, 95], brew?.water_temp ?? 0, 'water_temp')}
        </div>
        <div>
          <label className="block text-sm font-medium">蒸らし湯量 [ml] { baseBrew ? `(${baseBrew.bloom_water_amount})` : '' }</label>
          {renderPresetButtons(bloomAmountOptions(), brew?.bloom_water_amount ?? 0, 'bloom_water_amount')}
        </div>
        <div>
          <label className="block text-sm font-medium">蒸らし時間 [秒] { baseBrew ? `(${baseBrew.bloom_time})` : '' }</label>
          {renderPresetButtons([30, 45, 60], brew?.bloom_time ?? 0, 'bloom_time')}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">注湯</label>
          {(brew?.pours ?? []).map((pour: number, index: number) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-md">
              <div>
                <label className="block text-sm font-medium">
                  {index + 1}湯目 [ml] {Array.isArray(baseBrew?.pours) && baseBrew.pours[index] > 0 ? `(${baseBrew.pours[index]})` : '' }
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pour || ''}
                  onChange={(e) => handlePourChange(index, Number(e.target.value))}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
                {index === (brew?.pours ?? []).length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const updatedPours = (brew?.pours ?? []).filter((_, i) => i !== index);
                    setBrew({ ...brew, pours: updatedPours});
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
          <label className="block text-sm font-medium">総合評価 { baseBrew ? `(${baseBrew.overall_score})` : '' }</label>
          <StarRating rating={brew?.overall_score ?? 0} onRatingChange={(rating) => setBrew({ ...brew, overall_score: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">苦味 { baseBrew ? `(${baseBrew.bitterness})` : '' }</label>
          <StarRating rating={brew?.bitterness ?? 0} onRatingChange={(rating) => setBrew({ ...brew, bitterness: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">酸味 { baseBrew ? `(${baseBrew.acidity})` : '' }</label>
          <StarRating rating={brew?.acidity ?? 0} onRatingChange={(rating) => setBrew({ ...brew, acidity: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">甘味 { baseBrew ? `(${baseBrew.sweetness})` : '' }</label>
          <StarRating rating={brew?.sweetness ?? 0} onRatingChange={(rating) => setBrew({ ...brew, sweetness: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={brew?.notes}
            onChange={(e) => setBrew({ ...brew, notes: e.target.value })}
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