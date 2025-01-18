-- FOREIGN KEY制約が影響を受けない順番で削除する
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS brews;
DROP TABLE IF EXISTS beans;
DROP TABLE IF EXISTS users;

-- ユーザー情報テーブル
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_account_id TEXT NOT NULL UNIQUE,     -- GoogleユーザーID
    email TEXT UNIQUE NOT NULL,                   -- メールアドレス
    name TEXT,                                    -- 表示名
    photo_url TEXT,                               -- プロフィール画像URL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- ユーザー作成日時
);

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
    notes TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 抽出記録テーブル
CREATE TABLE IF NOT EXISTS brews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bean_id) REFERENCES beans (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 設定情報テーブル
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings JSON NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- サンプルデータ挿入
INSERT INTO users (id, provider_account_id, email, name)
VALUES
(1, '000000000000000000000', 'foobar@example.com', 'foo bar');

INSERT INTO beans (id, name, country, area, drying_method, processing_method, roast_level, photo_url, notes, user_id)
VALUES
(1, 'メキシコ オアハカ ハニー', 'メキシコ', 'オアハカ', 'ペタテドライ', 'ハニー', '中煎り', '', '', 1),
(2, 'オリエンテナチュラル', 'グアテマラ', 'オリエンテ', 'ナチュラル', 'ナチュラル', '浅煎り', '', '', 1);

INSERT INTO brews (id, bean_id, bean_amount, grind_size, cups, water_temp, bloom_water_amount, bloom_time, pours, overall_score, bitterness, acidity, sweetness, notes, user_id)
VALUES
(1, 1, 20, '中細', 2, 85, 55, 45, '[140, 220, 300]', 4, 3, 2, 4, 'フルーティーでおいしい', 1);

INSERT INTO settings (id, settings, user_id)
VALUES
(1, '{}', 1);
