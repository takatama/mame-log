-- コーヒー豆情報テーブル
DROP TABLE IF EXISTS beans;
CREATE TABLE IF NOT EXISTS beans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    origin TEXT,
    roast_level TEXT,
    purchase_date DATE,
    roast_date DATE,
    photo_url TEXT
);

-- 抽出記録テーブル
DROP TABLE IF EXISTS brew_logs;
CREATE TABLE IF NOT EXISTS brew_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bean_id INTEGER NOT NULL,
    grind_size TEXT,
    water_temp INTEGER,
    bloom_time INTEGER,
    bloom_water INTEGER,
    brew_date DATETIME NOT NULL,
    FOREIGN KEY (bean_id) REFERENCES beans (id)
);

-- 注湯詳細テーブル
DROP TABLE IF EXISTS pours;
CREATE TABLE IF NOT EXISTS pours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_log_id INTEGER NOT NULL,
    pour_number INTEGER NOT NULL,
    pour_amount INTEGER NOT NULL,
    flow_rate TEXT,
    FOREIGN KEY (brew_log_id) REFERENCES brew_logs (id)
);

-- 評価情報テーブル
DROP TABLE IF EXISTS ratings;
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_log_id INTEGER NOT NULL,
    acidity INTEGER,
    sweetness INTEGER,
    bitterness INTEGER,
    overall_score INTEGER,
    notes TEXT,
    FOREIGN KEY (brew_log_id) REFERENCES brew_logs (id)
);

-- 抽出記録に合計注湯量を加えたビュー
DROP VIEW IF EXISTS brew_logs_with_total;
CREATE VIEW IF NOT EXISTS brew_logs_with_total AS
SELECT 
    bl.*,
    COALESCE(SUM(p.pour_amount), 0) AS pour_total,
    COALESCE(bl.bloom_water, 0) + COALESCE(SUM(p.pour_amount), 0) AS total_water
FROM 
    brew_logs bl
LEFT JOIN 
    pours p ON bl.id = p.brew_log_id
GROUP BY 
    bl.id;
