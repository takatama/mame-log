import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';

interface BrewContextProps {
  beans: Bean[];
  brews: Brew[];
}

const BrewContext = createContext<BrewContextProps | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brews, setBrews] = useState<Brew[]>([]);

  // データを取得するロジックをここに追加
  // useEffect(() => {
  //   fetchBeans().then(setBeans);
  //   fetchBrews().then(setBrews);
  // }, []);

  useEffect(() => {
    const beansFixture: Bean[] = [
      {
        id: '1',
        name: 'メキシコ オアハカ ハニー',
        country: 'メキシコ',
        area: 'オアハカ',
        dryingMethod: 'ペタテドライ',
        processingMethod: 'ハニー',
        roastLevel: '中煎り',
        roastDate: '2024-11-30',
        purchaseAmount: 200,
        purchaseDate: '2024-12-01',
        price: 1500,
        seller: 'コーヒー豆専門店A',
        sellerUrl: 'https://example.com',
        photoUrl: 'https://via.placeholder.com/150',
        isActive: true,
      },
      {
        id: '2',
        name: 'オリエンテナチュラル',
        country: 'グアテマラ',
        area: 'オリエンテ',
        dryingMethod: 'ナチュラル',
        processingMethod: 'ナチュラル',
        roastLevel: '浅煎り',
        roastDate: '2024-01-03',
        purchaseAmount: 250,
        purchaseDate: '2024-01-01',
        price: 1800,
        seller: 'コーヒー豆太郎',
        sellerUrl: 'https://example.com',
        photoUrl: 'https://via.placeholder.com/150',
        isActive: true,
      },
    ]

    setBeans(beansFixture)

    const brewsFixture: Brew[] = [
      {
        id: '1',
        brewDate: '2024-12-30T08:00:00',
        bean: {
          id: '1',
          name: 'メキシコ オアハカ ハニー',
          country: 'メキシコ',
          area: 'オアハカ',
          dryingMethod: 'ペタテドライ',
          processingMethod: 'ハニー',
          roastLevel: '中煎り',
          roastDate: '2024-11-30',
          purchaseAmount: 200,
          purchaseDate: '2024-12-01',
          price: 1500,
          seller: 'コーヒー豆専門店A',
          sellerUrl: 'https://example.com',
          photoUrl: 'https://via.placeholder.com/150',
          isActive: true,
        },
        beanAmount: 20,
        grindSize: '中挽き',
        cups: 2,
        waterTemp: 85,
        pours: [
          { index: 0, amount: 60, flowRate: 'ゆっくり', time: 30 },
          { index: 1, amount: 170, flowRate: '普通' },
          { index: 2, amount: 170, flowRate: '普通' },
        ],
        overallScore: 4,
        bitterness: 3,
        acidity: 2,
        sweetness: 4,
        notes: 'フルーティーでおいしい',
      },
    ]

    setBrews(brewsFixture)
  }, [])

  return (
    <BrewContext.Provider value={{ beans, brews }}>
      {children}
    </BrewContext.Provider>
  );
};

export const useBrewContext = () => {
  const context = useContext(BrewContext);
  if (!context) {
    throw new Error('useBrewContext must be used within a BrewProvider');
  }
  return context;
};