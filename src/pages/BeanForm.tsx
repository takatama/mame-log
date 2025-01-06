import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBrewContext } from '../context/BrewContext';

const BeanForm: React.FC = () => {
  const { beans } = useBrewContext();
  const { beanId } = useParams();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [area, setArea] = useState('');
  const [drying_method, setDryingMethod] = useState('');
  const [processing_method, setProcessingMethod] = useState('');
  const [roast_level, setRoastLevel] = useState('');
  const [roast_date, setRoastDate] = useState('');
  const [seller, setSeller] = useState('');
  const [seller_url, setSellerUrl] = useState('');
  const [purchase_date, setPurchaseDate] = useState('');
  const [purchase_amount, setPurchaseAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [photo_url, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [is_active, setIsActive] = useState(true);

  useEffect(() => {
    if (beanId) {
      const bean = beans.find((bean) => bean.id === Number(beanId));
      if (bean) {
        setName(bean.name);
        setCountry(bean.country);
        setArea(bean.area);
        setDryingMethod(bean.drying_method);
        setProcessingMethod(bean.processing_method);
        setRoastLevel(bean.roast_level);
        setRoastDate(bean.roast_date);
        setSeller(bean.seller);
        setSellerUrl(bean.seller_url);
        setPurchaseDate(bean.purchase_date);
        setPurchaseAmount(bean.purchase_amount);
        setPrice(bean.price);
        setPhotoUrl(bean.photo_url);
        setNotes(bean.notes ?? '');
        setIsActive(bean.is_active);
      }
    }
  }, [beanId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBean = {
      name,
      country,
      area,
      drying_method,
      processing_method,
      roast_level,
      roast_date,
      seller,
      seller_url,
      purchase_date,
      purchase_amount,
      price,
      photo_url,
      notes,
      is_active
    };

    console.log(newBean);

    if (beanId) {
      fetch(`/api/beans/${beanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBean)
      });
    } else {
      fetch('/api/beans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBean)
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">新しいコーヒー豆を追加</h1> */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">有効</label>
          <input
            type="checkbox"
            checked={is_active}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">豆の名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">国</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">地域</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">乾燥方法</label>
          <input
            type="text"
            value={drying_method}
            onChange={(e) => setDryingMethod(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">処理方法</label>
          <input
            type="text"
            value={processing_method}
            onChange={(e) => setProcessingMethod(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎度</label>
          <input
            type="text"
            value={roast_level}
            onChange={(e) => setRoastLevel(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎日</label>
          <input
            type="date"
            value={roast_date}
            onChange={(e) => setRoastDate(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入日</label>
          <input
            type="date"
            value={purchase_date}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入量（g）</label>
          <input
            type="number"
            value={purchase_amount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">価格（円）</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">販売者</label>
          <input
            type="text"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">販売者URL</label>
          <input
            type="url"
            value={seller_url}
            onChange={(e) => setSellerUrl(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">写真URL</label>
          <input
            type="url"
            value={photo_url}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <button className="bg-blue-500 text-white p-2 rounded-md">保存する</button>
      </form>
    </div>
  );
};

export default BeanForm;
