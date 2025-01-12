import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bean } from '../types/Bean';
import { Brew, generateOptions, totalWaterAmount } from '../types/Brew';
import { useBrewContext } from '../context/BrewContext';
import StarRating from '../components/StarRating';
import { useSettingsContext } from '../context/SettingsContext';

const BrewForm: React.FC = () => {
  const { beans, brews, updateBrew, setBrews } = useBrewContext();
  const { brewId, beanId, baseBrewId } = useParams<{ brewId?: string; beanId?: string; baseBrewId?: string }>();
  const [bean, setBean] = useState<Bean | undefined>(undefined);
  const [brew, setBrew] = useState<Brew>({ brew_date: new Date().toISOString() });
  const [baseBrew, setBaseBrew] = useState<Brew>();
  const { settings } = useSettingsContext();
  
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
  
  const isPositive = (num : number | undefined) => num && num > 0;

  const renderBrewForm = () => {
    const cups = brew?.cups ?? 1; // デフォルトで1カップ
    return Object.entries(settings).map(([key, setting]) => {
      const diff = (baseBrew && baseBrew[setting.key]) ? `(${baseBrew[setting.key]})` : '';
      return (
        <div key={key}>
          <label className="block text-sm font-medium">
            {setting.displayName} {setting.unitLabel ? `[${setting.unitLabel}]` : ""} {diff || ""}
          </label>
          <div className="flex space-x-4 py-2">
            {generateOptions(setting, cups).map((option, _, array) => (
              <button
                type="button"
                key={option}
                onClick={() => setBrew({ ...brew, [setting.key]: option })}
                className={`p-2 rounded-md flex-1 w-1/${array.length} ${
                  brew[setting.key] === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    });
  };

  if (!brew) return <div>読み込み中...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {brewId ? '抽出ログを編集' : '新しく淹れる'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        {renderBrewForm()}
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
                <label className="block text-sm font-medium">
                  湯量の累計: {totalWaterAmount(brew, index)} [ml]
                </label>
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
          <label className="block text-sm font-medium">総合評価 { isPositive(baseBrew?.overall_score) ? `(${baseBrew?.overall_score})` : '' }</label>
          <StarRating rating={brew?.overall_score ?? 0} onRatingChange={(rating) => setBrew({ ...brew, overall_score: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">苦味 { isPositive(baseBrew?.bitterness) ? `(${baseBrew?.bitterness})` : '' }</label>
          <StarRating rating={brew?.bitterness ?? 0} onRatingChange={(rating) => setBrew({ ...brew, bitterness: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">酸味 { isPositive(baseBrew?.acidity) ? `(${baseBrew?.acidity})` : '' }</label>
          <StarRating rating={brew?.acidity ?? 0} onRatingChange={(rating) => setBrew({ ...brew, acidity: rating })} />
        </div>
        <div>
          <label className="block text-sm font-medium">甘味 { isPositive(baseBrew?.sweetness) ? `(${baseBrew?.sweetness})` : '' }</label>
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