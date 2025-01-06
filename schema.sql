-- FOREING KEY制約が影響を受けない順番で削除する
DROP TABLE IF EXISTS pours;
DROP TABLE IF EXISTS brews;
DROP TABLE IF EXISTS beans;

-- コーヒー豆情報テーブル
CREATE TABLE IF NOT EXISTS beans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT,
    area TEXT,
    drying_method TEXT,
    processing_method TEXT,
    roast_level TEXT,
    roast_date DATE,
    purchase_date DATE,
    purchase_amount INTEGER,
    price INTEGER,
    seller TEXT,
    seller_url TEXT,
    photo_url TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1
);

INSERT INTO beans (id, name, country, area, drying_method, processing_method, roast_level, roast_date, purchase_date, purchase_amount, price, seller, seller_url, photo_url, is_active)
VALUES
(1, 'メキシコ オアハカ ハニー', 'メキシコ', 'オアハカ', 'ペタテドライ', 'ハニー', '中煎り', '2024-11-30', '2024-12-01', 200, 1500, 'コーヒー豆専門店A', 'https://example.com', 'https://via.placeholder.com/150', 1),
(2, 'オリエンテナチュラル', 'グアテマラ', 'オリエンテ', 'ナチュラル', 'ナチュラル', '浅煎り', '2024-01-03', '2024-01-01', 250, 1800, 'コーヒー豆太郎', 'https://example.com', 'https://via.placeholder.com/150', 1);

-- 抽出記録テーブル
DROP TABLE IF EXISTS brews;
CREATE TABLE IF NOT EXISTS brews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_date DATETIME NOT NULL,
    bean_id INTEGER NOT NULL,
    bean_amount INTEGER,
    cups INTEGER,
    grind_size TEXT,
    water_temp INTEGER,
    overall_score INTEGER,
    bitterness INTEGER,
    acidity INTEGER,
    sweetness INTEGER,
    notes TEXT,
    FOREIGN KEY (bean_id) REFERENCES beans (id)
);

INSERT INTO brews (id, brew_date, bean_id, bean_amount, grind_size, cups, water_temp, overall_score, bitterness, acidity, sweetness, notes)
VALUES
(1, '2024-12-30T08:00:00', 1, 20, '中挽き', 2, 85, 4, 3, 2, 4, 'フルーティーでおいしい');

-- 注湯詳細テーブル
CREATE TABLE IF NOT EXISTS pours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_id INTEGER NOT NULL,
    idx INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    flow_rate TEXT,
    time INTEGER,
    FOREIGN KEY (brew_id) REFERENCES brews (id)
);

INSERT INTO pours (id, brew_id, idx, amount, flow_rate, time)
VALUES
(1, 1, 0, 60, 'ゆっくり', 30),
(2, 1, 1, 170, '普通', 60),
(3, 1, 2, 170, '普通', 60);
