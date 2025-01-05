import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-white text-lg font-semibold">豆ログ</Link>
        <div className="flex space-x-4">
          <Link to="/brews" className="text-gray-300 hover:text-white">抽出ログ</Link>
          <Link to="/beans" className="text-gray-300 hover:text-white">豆</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">設定</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
