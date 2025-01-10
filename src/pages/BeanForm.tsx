import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrewContext } from '../context/BrewContext';
import { Bean } from '../types/Bean';
import { fromUtcToLocalDate, fromLocalToUtc } from '../utils/date';

const BeanForm: React.FC = () => {
  const { beans, updateBean, setBeans } = useBrewContext();
  const { beanId } = useParams();
  const [bean, setBean] = useState<Bean>({
    is_active: true,
    name: '',
    country: '',
    area: '',
    drying_method: '',
    processing_method: '',
    roast_level: '',
    roast_date: '',
    purchase_date: '',
    purchase_amount: 0,
    price: 0,
    seller: '',
    seller_url: '',
    photo_url: '',
    notes: '',
  });
  const navigate = useNavigate();
  const location = useLocation();

  const getBeanById = (beanId: number) => {
    return beans.find(bean => bean.id === beanId);
  }

  useEffect(() => {
    // `location.state`からデータを取得して反映
    if (location.state && typeof location.state?.bean === 'object') {
      setBean((prevBean) => ({
        ...prevBean,
        ...(location.state.bean as Bean),
      }));
      return;
    }

    // `beanId`がある場合、既存のデータを取得
    if (beanId) {
      const existingBean = getBeanById(Number(beanId));
      if (existingBean) {
        setBean(existingBean);
      }
    }
  }, [beanId, location.state]);

  const handlePost = async (newBean: Bean) => {
    try {
      const response = await fetch('/api/beans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBean),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create bean: ${response.statusText}`);
      }
  
      const createdBean: Bean = await response.json();
      // 作成されたIDで更新
      setBeans([...beans, createdBean]);
      navigate(`/beans/${createdBean.id}`);
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the bean. Please try again.');
    }
  };
  
  const handlePut = async (beanId: number, updatedBean: Bean) => {
    const previousBean = getBeanById(beanId); // 現在の状態を取得
    try {
      updateBean(updatedBean); // 状態を一時的に更新
      navigate(`/beans/${beanId}`);
      const response = await fetch(`/api/beans/${beanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBean),
      });
  
      if (!response.ok) {
        if (previousBean) updateBean(previousBean); // エラー時に元の状態を復元
        throw new Error(`Failed to update bean: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      if (previousBean) updateBean(previousBean); // エラー時に元の状態を復元
      alert('An error occurred while updating the bean. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const tempId = Date.now();
    const newBean = {
      ...bean,
      id: beanId ? Number(beanId) : tempId,
    };
  
    if (beanId) {
      await handlePut(Number(beanId), newBean);
    } else {
      await handlePost(newBean);
    }
  };

  const handleNavigateToCapture = () => {
    navigate(`/beans/${beanId || 'new'}/capture`);
  };

  if (!bean) {
    return <div>豆が見つかりません。</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {beanId ? '豆の編集' : '豆の追加'}
      </h1>
      {(bean.photo_data_url || bean.photo_url) && (
        <div className="mb-4">
          <img
            src={bean.photo_data_url || bean.photo_url}
            alt={bean.name || 'Bean'}
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
      <button
          type="button"
          onClick={handleNavigateToCapture}
          className="bg-green-500 text-white py-2 px-4 rounded-md mr-2"
        >
          AIでラベルを解析
      </button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">有効</label>
          <input
            type="checkbox"
            checked={bean.is_active}
            onChange={(e) => setBean({ ...bean, is_active: e.target.checked })}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">豆の名前</label>
          <input
            type="text"
            value={bean.name}
            onChange={(e) => setBean({ ...bean, name: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">国</label>
          <input
            type="text"
            value={bean.country}
            onChange={(e) => setBean({ ...bean, country: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">地域</label>
          <input
            type="text"
            value={bean.area}
            onChange={(e) => setBean({ ...bean, area: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">乾燥方法</label>
          <input
            type="text"
            value={bean.drying_method}
            onChange={(e) => setBean({ ...bean, drying_method: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">処理方法</label>
          <input
            type="text"
            value={bean.processing_method}
            onChange={(e) => setBean({ ...bean, processing_method: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎度</label>
          <input
            type="text"
            value={bean.roast_level}
            onChange={(e) => setBean({ ...bean, roast_level: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎日</label>
          <input
            type="date"
            value={fromUtcToLocalDate(bean.roast_date)}
            onChange={(e) => setBean({ ...bean, roast_date: fromLocalToUtc(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入日</label>
          <input
            type="date"
            value={fromUtcToLocalDate(bean.purchase_date)}
            onChange={(e) => setBean({ ...bean, purchase_date: fromLocalToUtc(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入量 (g)</label>
          <input
            type="number"
            value={bean.purchase_amount}
            onChange={(e) => setBean({ ...bean, purchase_amount: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">価格 (円)</label>
          <input
            type="number"
            value={bean.price}
            onChange={(e) => setBean({ ...bean, price: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">販売者</label>
          <input
            type="text"
            value={bean.seller}
            onChange={(e) => setBean({ ...bean, seller: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">販売者URL</label>
          <input
            type="url"
            value={bean.seller_url}
            onChange={(e) => setBean({ ...bean, seller_url: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={bean.notes}
            onChange={(e) => setBean({ ...bean, notes: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <button className="bg-blue-500 text-white p-2 rounded-md">保存する</button>
      </form>
    </div>
  );
};

export default BeanForm;
