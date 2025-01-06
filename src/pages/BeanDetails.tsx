import React from 'react';
import { useBrewContext } from '../context/BrewContext';
import { Link, useParams } from 'react-router-dom';

const BeanDetail: React.FC = () => {
  const { beans } = useBrewContext()
  const { beanId } = useParams<{ beanId?: string }>()
  const bean = beans.find(bean => bean.id === beanId)

  if (!bean) {
    return <div>豆が見つかりません。</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{bean.name}</h1>
      <img
        src={bean.photoUrl}
        alt={bean.name}
        className="mb-4 w-32 h-32 object-cover"
      />
      <p>
        <strong>国:</strong> {bean.country}
      </p>
      <p>
        <strong>地域:</strong> {bean.area}
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
        <strong>販売者:</strong> <a href={bean.sellerUrl} target='_blank'>{bean.seller}</a>
      </p>
      <p>
        <strong>メモ:</strong> {bean.notes}
      </p>
      <p>
        <strong>有効:</strong> {bean.isActive ? 'はい' : 'いいえ'}
      </p>
        <div className="mt-4">
          <Link
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            to={`/beans/${beanId}/brews/new`}>
            この豆で淹れる
          </Link>
        </div>
    </div>
  )
};

export default BeanDetail;
