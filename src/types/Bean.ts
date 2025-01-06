export interface Bean {
  id: number;
  name: string;
  country: string;
  area: string;
  dryingMethod: string;
  processingMethod: string;
  roastLevel: string;
  roastDate: string;
  purchaseDate: string;
  purchaseAmount: number; // g
  price: number; // JPY
  seller: string;
  sellerUrl: string;
  photoUrl: string;
}

export interface Beans {
  beans: Bean[];
}
