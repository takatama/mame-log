import { Bean } from "./Bean";

export interface Pour {
  index: number;
  amount: number; // ml
  flowRate: string;
  time?: number; // s
}

export interface Brew {
  id: number;
  brewDate: string;
  bean: Bean;
  beanAmount: number; // g
  cups: number;
  grindSize: string;
  waterTemp: number; // ℃
  pours: Pour[];
  overallScore: number;
  bitterness?: number;
  acidity?: number;
  sweetness?: number;
  notes?: string;
}

export interface Brews {
  brews: Brew[];
}
