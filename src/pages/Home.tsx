import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6">豆ログへようこそ</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        あなたのコーヒー体験を記録し、最高の一杯を見つけるお手伝いをします。
      </p>
      <div className="flex space-x-4">
        <a
          href="/api/auth/signin"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          サインイン
        </a>
        <Link
          to="/signup"
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          サインアップ
        </Link>
      </div>
    </div>
  );
};

export default Home;
