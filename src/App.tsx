import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrewForm from './pages/BrewForm';
import BrewList from './pages/BrewList';
import BrewDetails from './pages/BrewDetails';
import Settings from './pages/Settings';
import BeanForm from './pages/BeanForm';
import BeanList from './pages/BeanList';
import BeanDetails from './pages/BeanDetails';

const App: React.FC = () => {
  const beans = [
    {
      id: 1,
      name: 'メキシコ オアハカ ハニー',
      country: 'メキシコ',
      area: 'オアハカ',
      dryingMethod: 'ペタテドライ',
      processingMethod: 'ハニー',
      roastLevel: '中煎り',
      purchaseAmount: { value: 200, unit: 'g' },
      price: { value: 1500, currency: 'JPY' },
      purchaseDate: '2024-12-01',
      roastDate: '2024-11-30',
      photoUrl: 'https://via.placeholder.com/150',
      seller: 'コーヒー豆専門店A',
      sellerUrl: 'https://example.com',
    },
    {
      id: 2,
      name: 'オリエンテナチュラル',
      country: 'グアテマラ',
      area: 'オリエンテ',
      roastLevel: '浅煎り',
      purchaseAmount: { value: 250, unit: 'g' },
      price: { value: 1800, currency: 'JPY' },
      photoUrl: 'https://via.placeholder.com/150',
      purchaseDate: '2024-01-01',
      roastDate: '2024-01-03',
      dryingMethod: 'ナチュラル',
      processingMethod: 'ナチュラル',
      seller: 'コーヒー豆太郎',
      sellerUrl: 'https://example.com',
    },
  ];

  // 該当する `bean` を抽出するヘルパーコンポーネント
  const BeanDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const bean = beans.find((b) => b.id === parseInt(id || '', 10));
    return bean ? <BeanDetails bean={bean} /> : <p>Bean not found</p>;
  };

  const brews = [
    {
      id: 1,
      bean: {
        id: 1,
        name: 'メキシコ オアハカ ハニー',
        country: 'メキシコ',
        area: 'オアハカ',
        dryingMethod: 'ペタテドライ',
        processingMethod: 'ハニー',
        roastLevel: '中煎り',
        purchaseAmount: { value: 200, unit: 'g' },
        price: { value: 1500, currency: 'JPY' },
        purchaseDate: '2024-12-01',
        roastDate: '2024-11-30',
        photoUrl: 'https://via.placeholder.com/150',
        seller: 'コーヒー豆専門店A',
        sellerUrl: 'https://example.com',  
      },
      beanAmount: 20,
      grindSize: '中挽き',
      waterTemp: 85,
      bloomTime: 30,
      bloomWater: 50,
      brewDate: '2024-12-30T08:00:00',
      pours: [
        { pourNumber: 1, amount: 100, flowRate: '2.0' },
        { pourNumber: 2, amount: 150, flowRate: '1.5' },
      ],
      rating: 4,
    }
  ];

  const BrewDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const brew = brews.find((b) => b.id === parseInt(id || '', 10));
    return brew ? <BrewDetails brew={brew} /> : <p>Brew log not found</p>;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* ナビゲーションバー */}
        <Navbar />

        {/* メインコンテンツ */}
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beans" element={<BeanList beans={beans} />} />
            <Route path="/beans/new" element={<BeanForm />} />
            <Route path="/beans/:id" element={<BeanDetailWrapper />} />
            <Route path="/brews" element={<BrewList brews={brews} />} />
            <Route path="/brews/new" element={<BrewForm />} />
            <Route path="/brews/:id" element={<BrewDetailWrapper />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* フッター */}
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; 2025 <a target="_blank" href="https://x.com/takatama_jp">@takatama_jp</a>. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
