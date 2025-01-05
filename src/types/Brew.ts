import { Bean } from "./Bean";

export interface Pour {
  pourNumber: number;
  amount: number;
  flowRate: string;
}

export interface Brew {
  id: number;
  bean: Bean;
  beanAmount: number;
  grindSize: string;
  waterTemp: number;
  bloomTime: number;
  bloomWater: number;
  pours: Pour[];
  brewDate: string;
  rating: number;
}

export interface Brews {
  brews: Brew[];
}
