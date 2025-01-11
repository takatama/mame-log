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
