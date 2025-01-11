import { BrewSettings } from "../types/Brew";

export const DefaultBrewSettings: BrewSettings = {
  cups: {
    key: "cups",
    displayName: "カップ数",
    fixedOptions: [1, 2, 3, 4],
  },
  beanAmount: {
    key: "bean_amount",
    displayName: "豆の量",
    unitLabel: "g",
    baseAmountPerCup: 10, // 1カップにつき10g
    stepSize: 2, // 増減幅2g
    numSteps: 5, // 5段階
    dynamicOptions: (cups, baseAmountPerCup, stepSize, numSteps) =>
      // 2g刻みで5段階に増減できるようにする
      // 2 cups の場合は [16, 18, 20, 22, 24]
      Array.from({ length: numSteps }, (_, i) => (cups ?? 1) * baseAmountPerCup + (i - 2) * stepSize),
  },
  grindSize: {
    key: "grind_size",
    displayName: "挽き具合",
    fixedOptions: ['極細', '細', '中細', '中', '粗']
  },
  waterTemp: {
    key: "water_temp",
    displayName: "湯温",
    unitLabel: "℃",
    fixedOptions: [80, 85, 90, 95],
  },
  bloomWaterAmount: {
    key: "bloom_water_amount",
    displayName: "蒸らし湯量",
    unitLabel: "ml",
    baseAmountPerCup: 20, // 1カップにつき20ml
    stepSize: 5, // 増減幅 5ml
    numSteps: 6, // 6段階
    dynamicOptions: (cups, baseAmountPerCup, stepSize, numSteps) =>
      // 5ml刻みで6段階に増減できるようにする
      // 2カップの場合は [35, 40, 45, 50, 55, 60]
      Array.from({ length: numSteps }, (_, i) => (cups ?? 1) * baseAmountPerCup + (i - 2) * stepSize + stepSize),
  },
  bloomTime: {
    key: "bloom_time",
    displayName: "蒸らし時間",
    unitLabel: "秒",
    fixedOptions: [30, 45, 60],
  },
};
