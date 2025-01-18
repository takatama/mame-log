import { Tag } from "./Tag";

export interface Bean {
  id?: number;
  name?: string;
  country?: string;
  area?: string;
  drying_method?: string;
  processing_method?: string;
  roast_level?: string;
  photo_url?: string;
  photo_data_url?:string;
  notes?: string;
  tags: Tag[];
}
