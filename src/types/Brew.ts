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
  key: keyof Brew;           // 対応するBrewのプロパティ名
  displayName: string;       // 項目の表示名
  isNumeric: boolean;        // 項目が数字かどうか
  unitLabel?: string;        // 項目の単位（例: "ml", "g"）
  fixedOptions?: T[];        // 固定選択肢（動的生成がない場合）
  baseAmountPerCup?: number; // カップ数に対する基本量
  stepSize?: number;         // 増減幅
  numSteps?: number;         // 段階数
  // 動的選択肢生成
  dynamicOptions?: (cups: number, baseAmountPerCup: number, stepSize: number, numSteps: number) => T[];
}

export const generateOptions = <T>(
  setting: BrewSettingOption<T>,
  cups: number
): T[] => {
  if (setting.dynamicOptions && setting.baseAmountPerCup && setting.stepSize && setting.numSteps) {
    return setting.dynamicOptions(cups, setting.baseAmountPerCup, setting.stepSize, setting.numSteps);
  }
  return setting.fixedOptions ?? [];
};

export type BrewSettings = {
  [key: string]: BrewSettingOption<any>;
};