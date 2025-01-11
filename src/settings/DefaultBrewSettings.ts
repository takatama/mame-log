import { BrewSettings, DynamicBrewSettingOption, FixedBrewSettingOption } from "../types/Brew";

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
  dynamicOptions: (cups, baseAmountPerCup, stepSize, numSteps) => {
    // 2g刻みで5段階に増減できるようにする
    // 2 cups の場合は [16, 18, 20, 22, 24]
    const options = Array.from({ length: numSteps }, (_, i) => (cups ?? 1) * baseAmountPerCup + (i - 2) * stepSize);
    return options.filter(option => option > 0);
  }
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
  stepSize: 5,          // 増減幅 5ml
  numSteps: 6,          // 6段階
  dynamicOptions: (cups, baseAmountPerCup, stepSize, numSteps) => {
    // 5ml刻みで6段階に増減できるようにする
    // 2カップの場合は [35, 40, 45, 50, 55, 60]
    const options = Array.from({ length: numSteps }, (_, i) => (cups ?? 1) * baseAmountPerCup + (i - 2) * stepSize + stepSize);
    return options.filter(option => option > 0);
  }
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
