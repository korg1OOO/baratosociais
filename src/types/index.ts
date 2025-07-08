export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  platform: string;
  minQuantity: number;
  maxQuantity: number;
  deliveryTime: string;
  features: string[];
  popular?: boolean;
  apiServiceId?: number;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  socialHandle: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  apiOrderId?: number;
}

export interface ApiOrder {
  id: string;
  serviceId: number;
  link: string;
  quantity: number;
  status: string;
  apiOrderId: number;
  createdAt: Date;
}