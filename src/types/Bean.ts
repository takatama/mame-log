export interface Bean {
  id: number;
  name: string;
  country: string;
  area: string;
  roastLevel: string;
  dryingMethod: string;
  processingMethod: string;
  seller: string;
  sellerUrl: string;
  purchaseDate: string;
  purchaseAmount: {
    value: number;
    unit: string;
  };
  price: {
    value: number;
    currency: string;
  };
  roastDate: string;
  photoUrl: string;
}

export interface Beans {
  beans: Bean[];
}
