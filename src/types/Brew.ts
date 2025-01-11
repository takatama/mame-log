import { Bean } from "./Bean";

export interface Brew {
  id?: number;
  brew_date: string;
  bean?: Bean;
  bean_id?: number;
  cups?: number;
  bean_amount?: number; // g
  grind_size?: string;
  water_temp?: number; // ℃
  bloom_water_amount?: number; // ml
  bloom_time?: number; // s
  pours?: number[];
  overall_score?: number;
  bitterness?: number;
  acidity?: number;
  sweetness?: number;
  notes?: string;
}

export interface BrewSettingOption<T> {
  property: keyof Brew; // 対応するBrewのプロパティ名
  label: string; // 項目のラベル
  unit?: string; // 項目の単位
  options?: T[]; // 固定選択肢（動的生成がない場合）
  amountPerCup?: number; // カップ数に対する質量
  step?: number; // 増減幅
  generateOptions?: (cups:number, amountPerCup: number, step: number) => T[]; // 動的選択肢を生成するアルゴリズム
}

export const generateOptions = <T>(
  setting: BrewSettingOption<T>,
  cups: number
): T[] => {
  if (setting.generateOptions && setting.amountPerCup && setting.step) {
    return setting.generateOptions(cups, setting.amountPerCup, setting.step);
  }
  return setting.options ?? [];
};

export type BrewSettings = {
  [key: string]: BrewSettingOption<any>;
};