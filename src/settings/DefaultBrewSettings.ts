import { BrewSettings, DynamicBrewSettingOption, FixedBrewSettingOption } from "../types/Brew";
import { generateDynamicOptions } from "../utils/dynamicOptions"

const cups: FixedBrewSettingOption<number> = {
  type: "fixed",
  key: "cups",
  displayName: "カップ数",
  isNumeric: true,
  fixedOptions: [1, 2, 3, 4],
};

const beanAmount: DynamicBrewSettingOption<number> = {
  type: "dynamic",
  key: "bean_amount",
  displayName: "豆の量",
  unitLabel: "g",
  isNumeric: true,
  baseAmountPerCup: 10, // 1カップにつき10g
  stepSize: 2,          // 増減幅2g
  numSteps: 5,          // 5段階
  dynamicOptions: generateDynamicOptions
};

const grindSize: FixedBrewSettingOption<string> = {
  type: "fixed",
  key: "grind_size",
  displayName: "挽き具合",
  isNumeric: false,
  fixedOptions: ['極細', '細', '中細', '中', '粗']
};

const waterTemp: FixedBrewSettingOption<number> = {
  type: "fixed",
  key: "water_temp",
  displayName: "湯温",
  unitLabel: "℃",
  isNumeric: true,
  fixedOptions: [80, 85, 90, 95],
};

const bloomWaterAmount: DynamicBrewSettingOption<number> = {
  type: "dynamic",
  key: "bloom_water_amount",
  displayName: "蒸らし湯量",
  unitLabel: "ml",
  isNumeric: true,
  baseAmountPerCup: 20, // 1カップにつき20ml
  stepSize: 10,         // 増減幅 10ml
  numSteps: 6,          // 6段階
  dynamicOptions: generateDynamicOptions
};

const bloomTime: FixedBrewSettingOption<number> = {
  type: "fixed",
  key: "bloom_time",
  displayName: "蒸らし時間",
  isNumeric: true,
  unitLabel: "秒",
  fixedOptions: [30, 45, 60],
};

export const DefaultBrewSettings: BrewSettings = {
  cups,
  beanAmount,
  grindSize,
  waterTemp,
  bloomWaterAmount,
  bloomTime,
};
