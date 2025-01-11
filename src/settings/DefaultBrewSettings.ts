import { BrewSettings } from "../types/Brew";

export const DefaultBrewSettings: BrewSettings = {
  cups: {
    property: "cups",
    label: "カップ数",
    options: [1, 2, 3, 4],
  },
  beanAmount: {
    property: "bean_amount",
    label: "豆の量",
    unit: "g",
    amountPerCup: 10, // 1カップにつき10g
    step: 2, // 増減幅2g
    generateOptions: (cups, amountPerCup, step) =>
      // 2g刻みで5段階に増減できるようにする
      // 2 cups の場合は [16, 18, 20, 22, 24]
      Array.from({ length: 5 }, (_, i) => (cups ?? 1) * amountPerCup + (i - 2) * step),
  },
  grindSize: {
    property: "grind_size",
    label: "挽き具合",
    options: ['極細', '細', '中細', '中', '粗']
  },
  waterTemp: {
    property: "water_temp",
    label: "湯温",
    unit: "℃",
    options: [80, 85, 90, 95],
  },
  bloomWaterAmount: {
    property: "bloom_water_amount",
    label: "蒸らし湯量",
    unit: "ml",
    amountPerCup: 20, // 1カップにつき20g
    step: 5, // 増減幅 5g
    generateOptions: (cups, amountPerCup, step) =>
      // 5ml刻みで6段階に増減できるようにする
      // 20g の場合は [35, 40, 45, 50, 55, 60]
      Array.from({ length: 6 }, (_, i) => (cups ?? 1) * amountPerCup + (i - 2) * step + step),
  },
  bloomTime: {
    property: "bloom_time",
    label: "蒸らし時間",
    unit: "秒",
    options: [30, 45, 60],
  },
};
