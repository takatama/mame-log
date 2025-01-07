import { Bean } from "./Bean";

export interface Pour {
  idx: number;
  amount: number; // ml
  flow_rate?: string;
  time?: number; // s
}

export interface Brew {
  id: number;
  brew_date: string;
  bean: Bean;
  bean_id: number;
  bean_amount: number; // g
  cups: number;
  grind_size: string;
  water_temp: number; // ℃
  pours: Pour[];
  overall_score: number;
  bitterness?: number;
  acidity?: number;
  sweetness?: number;
  notes?: string;
}
