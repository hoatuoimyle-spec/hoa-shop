export type Choice = { label: string; delta: number };
export type Option = { name: string; choices: Choice[] };

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  salePrice: number | null;
  images: string[];
  description: string;
  dimensions: string;
  materials: string;
  options: Option[];
  leadDays: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
};

export type Settings = {
  shopName: string;
  shopPhone: string;
  zalo: string;
  shopAddress: string;
  acceptingOrders: boolean;
  notice: string;
  shipNote: string;
  bankInfo: string;
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
  depositPercent: number;
  sameDayCutoffHour: number;
  turnstileSiteKey: string;
  hours: string;
  facebookUrl: string;
  tiktokUrl: string;
  timeSlots: string[];
};

export type ShopData = { products: Product[]; settings: Settings };

export type OrderResult = {
  ok: boolean;
  code: string;
  total: number;
  payment: 'cod' | 'bank';
  deposit: number;
  remaining: number;
  notified?: boolean;
};
