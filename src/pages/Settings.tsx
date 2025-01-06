import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [theme, setTheme] = useState('light'); // テーマ設定
  const [notifications, setNotifications] = useState(true); // 通知設定

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(event.target.checked);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">設定</h1>

      <div className="space-y-6">
        {/* テーマ設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">テーマ</label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="light">ライトモード</option>
            <option value="dark">ダークモード</option>
          </select>
        </div>

        {/* 通知設定 */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">通知を有効にする</span>
          </label>
        </div>

        <button className="bg-blue-500 text-white p-2 rounded-md">設定を保存</button>
      </div>
    </div>
  );
};

export default Settings;
