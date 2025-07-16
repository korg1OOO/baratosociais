export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // Price per 1000 units
  category: string;
  platform: string;
  minQuantity: number; // In thousands (e.g., 1 = 1000 units, must be >= 1)
  maxQuantity: number; // In thousands (e.g., 10 = 10000 units)
  deliveryTime: string;
  features: string[];
  popular?: boolean;
  apiServiceId?: number;
}

export interface CartItem {
  service: Service;
  quantity: number; // In thousands (e.g., 1 = 1000 units, 1.05 = 1050 units)
  link: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  socialHandle: string; // CPF/CNPJ for DuckFy API
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[]; // Quantity in thousands
  total: number; // Calculated as sum of (item.service.price * item.quantity)
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  createdAt: Date;
  apiOrderId?: number; // From placeOrder
  transactionId?: string; // From DuckFy Pix API
}

export interface ApiOrder {
  id: string;
  serviceId: number; // Matches Service.apiServiceId
  link: string;
  quantity: number; // Actual units (e.g., 1000, 1050)
  status: string;
  apiOrderId: number;
  createdAt: Date;
}