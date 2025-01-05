import React from 'react';
import { Link } from 'react-router-dom';
import { Brews } from '../types/Brew';

const Brews: React.FC<Brews> = ({ brews }) => {

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">抽出ログ一覧</h1>
        {/* 新しく淹れるボタン */}
        <Link
          to="/brews/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          新しく淹れる
        </Link>
      </div>

      <ul className="space-y-4">
        {brews.map((brew) => (
          <li key={brew.id} className="p-4 border rounded-md">
            <Link to={`/brews/${brew.id}`} className="text-blue-500 hover:underline">
              <h2 className="font-bold">{brew.brewDate}</h2>
              <p>豆: {brew.bean.name}</p>
              <p>評価: {'★'.repeat(brew.rating)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Brews;
