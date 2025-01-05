import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">豆ログへようこそ</h1>
      <div className="space-y-4">
        <Link to="/brews" className="block bg-blue-500 text-white p-4 rounded-lg text-center">抽出ログ</Link>
        <Link to="/beans" className="block bg-green-500 text-white p-4 rounded-lg text-center">豆の管理</Link>
        <Link to="/settings" className="block bg-green-500 text-white p-4 rounded-lg text-center">設定</Link>
      </div>
      {/* 最近のログや統計情報の表示 */}
    </div>
  );
};

export default Home;
