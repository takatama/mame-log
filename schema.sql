-- FOREING KEY制約が影響を受けない順番で削除する
DROP TABLE IF EXISTS settings;
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
    photo_url TEXT,
    notes TEXT
);

INSERT INTO beans (id, name, country, area, drying_method, processing_method, roast_level, photo_url, notes)
VALUES
(1, 'メキシコ オアハカ ハニー', 'メキシコ', 'オアハカ', 'ペタテドライ', 'ハニー', '中煎り', '', ''),
(2, 'オリエンテナチュラル', 'グアテマラ', 'オリエンテ', 'ナチュラル', 'ナチュラル', '浅煎り', '', '');

-- 抽出記録テーブル
CREATE TABLE IF NOT EXISTS brews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_date DATETIME NOT NULL,
    bean_id INTEGER NOT NULL,
    bean_amount INTEGER,
    cups INTEGER,
    grind_size TEXT,
    water_temp INTEGER,
    bloom_water_amount INTEGER,
    bloom_time INTEGER,
    pours JSON,
    overall_score INTEGER,
    bitterness INTEGER,
    acidity INTEGER,
    sweetness INTEGER,
    notes TEXT,
    FOREIGN KEY (bean_id) REFERENCES beans (id)
);

INSERT INTO brews (id, brew_date, bean_id, bean_amount, grind_size, cups, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes)
VALUES
(1, '2024-12-29T23:00:00.000Z', 1, 20, '中細', 2, 85, 55, 45, '[140, 220, 300]', 4, 3, 2, 4, 'フルーティーでおいしい');

-- 設定情報テーブル
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings JSON NOT NULL
);
INSERT INTO settings (id, settings)
VALUES
(1, '{}');
