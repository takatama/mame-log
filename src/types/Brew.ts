import { Bean } from './Bean';
import { Tag } from './Tag';

export interface Brew {
  id?: number;
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
  tags: Tag[];
  tagIds: number[];
  created_at?: string;
}

export const totalWaterAmount = (brew: Brew, pourIndex: number): number => {
  const bloomWaterAmount = brew.bloom_water_amount ?? 0;
  const pourAmount = brew.pours ? brew.pours.slice(0, pourIndex + 1).reduce((sum, value) => sum + value, 0) : 0;
  return bloomWaterAmount + pourAmount;
}
