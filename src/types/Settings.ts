import { Brew } from './Brew'

export interface BaseSettingOption<T> {
  key: keyof Brew;           // 対応するBrewのプロパティ名
  displayName: string;       // 項目の表示名
  isNumeric: boolean;        // 項目が数字かどうか
  unitLabel?: string;        // 項目の単位（例: "ml", "g"）
}

export interface FixedBrewSettingOption<T> extends BaseSettingOption<T> {
  type: 'fixed';
  fixedOptions: T[];        // 固定選択肢（動的生成がない場合）
}

export interface DynamicBrewSettingOption<T> extends BaseSettingOption<T> {
  type: 'dynamic';
  baseAmountPerCup: number; // カップ数に対する基本量
  stepSize: number;         // 増減幅
  numSteps: number;         // 段階数
  offset: number;           // 調整値
}

export type BrewSettingOption<T> = FixedBrewSettingOption<T> | DynamicBrewSettingOption<T>;

export function isFixedOption<T>(setting: BrewSettingOption<T>): setting is FixedBrewSettingOption<T> {
  return setting.type === 'fixed'
}

export function isDynamicOption<T>(setting: BrewSettingOption<T>): setting is DynamicBrewSettingOption<T> {
  return setting.type === 'dynamic'
}

function generateDynamicOptions<T>(
  cups: number,
  baseAmountPerCup: number,
  stepSize: number,
  numSteps: number,
  offset: number
): T[] {
  return Array.from({ length: numSteps }, (_, i) => 
    cups * baseAmountPerCup + (i - Math.floor(numSteps / 2)) * stepSize + offset
  ).filter(option => option > 0).map(option => option as T);
}

export const generateOptions = <T>(
  setting: BrewSettingOption<T>,
  cups: number = 1
): T[] => {
  if (isDynamicOption(setting)) {
    return generateDynamicOptions(cups, setting.baseAmountPerCup, setting.stepSize, setting.numSteps, setting.offset);
  }
  if (isFixedOption(setting)) {
    return setting.fixedOptions ?? [];
  }
  return [];
};

export type BrewSettings = {
  [key: string]: BrewSettingOption<string | number>;
};
