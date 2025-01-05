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
      <strong>原産地:</strong> {bean.country} ({bean.area})
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
      <strong>購入量:</strong> {bean.purchaseAmount.value}
      {bean.purchaseAmount.unit}
    </p>
    <p>
      <strong>価格:</strong> {bean.price.value}
      {bean.price.currency}
    </p>
    <p>
      <strong>販売者:</strong> {bean.seller}
    </p>
    <p>
      <strong>販売者のURL:</strong> {bean.sellerUrl}
    </p>
    <p>
      <strong>購入日:</strong> {bean.purchaseDate}
    </p>
    <p>
      <strong>焙煎日:</strong> {bean.roastDate}
    </p>
  </div>
);

export default BeanDetail;
