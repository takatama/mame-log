import React, { useState } from 'react';

const BeanForm: React.FC = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [area, setArea] = useState('');
  const [dryingMethod, setDryingMethod] = useState('');
  const [processingMethod, setProcessingMethod] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [roastDate, setRoastDate] = useState('');
  const [seller, setSeller] = useState('');
  const [sellerUrl, setSellerUrl] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBean = {
      name,
      country,
      area,
      dryingMethod,
      processingMethod,
      roastLevel,
      roastDate,
      seller,
      sellerUrl,
      purchaseDate,
      purchaseAmount,
      price,
      photoUrl
    };
    console.log(newBean);
    // APIリクエストでデータを保存
  };

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4">新しいコーヒー豆を追加</h1> */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">有効</label>
          <input
            type="checkbox"
            checked={isActive}
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
            value={dryingMethod}
            onChange={(e) => setDryingMethod(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">処理方法</label>
          <input
            type="text"
            value={processingMethod}
            onChange={(e) => setProcessingMethod(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎度</label>
          <input
            type="text"
            value={roastLevel}
            onChange={(e) => setRoastLevel(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎日</label>
          <input
            type="date"
            value={roastDate}
            onChange={(e) => setRoastDate(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入日</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">購入量</label>
          <input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">価格</label>
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
            value={sellerUrl}
            onChange={(e) => setSellerUrl(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">写真URL</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <button className="bg-blue-500 text-white p-2 rounded-md">保存</button>
      </form>
    </div>
  );
};

export default BeanForm;