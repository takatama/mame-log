export interface Bean {
  id: number;
  name?: string;
  country?: string;
  area?: string;
  drying_method?: string;
  processing_method?: string;
  roast_level?: string;
  roast_date?: string;
  purchase_date?: string;
  purchase_amount?: number; // g
  price?: number; // JPY
  seller?: string;
  seller_url?: string;
  photo_url?: string;
  notes?: string;
  is_active?: boolean;
}
