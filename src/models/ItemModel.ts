export interface ItemLot {
  lot_number: string;
  manufactured_at: string;
  expires_at: string;
  available_quantity: number;
  used_quantity: number;
}

export interface ItemPrice {
  item_price_list_hashed_id: string;
  default_selling_rate: string;
  default_buying_rate: string;
}

export interface Item {
  hashed_id: string;
  title: string;
  description: string;
  reference: string;
  type: number;
  destination: number;
  unity_id: string;
  stock: number;
  lots: ItemLot[];
  prices: ItemPrice[]; 
}
export interface NewItem {
  title: string;
  reference: string;
  description: string;
  taxe: string;
  type: number;
  destination: number;
  unity_id: string;
  category: string;
  brand: string;
  prices: {
    item_price_list_hashed_id: string;
    default_selling_rate: string;
    default_buying_rate: string;
  }[];
}