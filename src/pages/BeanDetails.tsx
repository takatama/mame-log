import React from 'react';
import { Bean } from '../types/Bean';

const BeanDetail: React.FC<{ bean: Bean }> = ({ bean }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">{bean.name}の詳細</h1>
    <img
      src={bean.photoUrl}
      alt={bean.name}
      className="mb-4 w-32 h-32 object-cover"
    />
    <p>
      <strong>国:</strong> {bean.country} ({bean.area})
    </p>
    <p>
      <strong>地域:</strong> {bean.country} ({bean.area})
    </p>
    <p>
      <strong>乾燥方法:</strong> {bean.dryingMethod}
    </p>
    <p>
      <strong>精製方法:</strong> {bean.processingMethod}
    </p>
    <p>
      <strong>焙煎度:</strong> {bean.roastLevel}
    </p>
    <p>
      <strong>焙煎日:</strong> {bean.roastDate}
    </p>
    <p>
      <strong>購入量:</strong> {bean.purchaseAmount} g
    </p>
    <p>
      <strong>購入日:</strong> {bean.purchaseDate}
    </p>
    <p>
      <strong>価格:</strong> {bean.price} 円
    </p>
    <p>
      <strong>販売者:</strong> <a href={bean.sellerUrl}>{bean.seller}</a>
    </p>
    <p>
      <strong>メモ:</strong> {bean.notes}
    </p>
    <p>
      <strong>有効:</strong> {bean.isActive ? 'はい' : 'いいえ'}
    </p>
  </div>
);

export default BeanDetail;
