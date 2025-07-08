export interface ApiService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export interface ApiOrderResponse {
  order: number;
}

export interface ApiOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

const API_KEY = '66dbcb0257919bcf2af6258de13872a0';
const API_URL = 'https://baratosociais.com/api/v2';

export class BaratoSociaisAPI {
  private async makeRequest(params: Record<string, any>) {
    const formData = new FormData();
    formData.append('key', API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getServices(): Promise<ApiService[]> {
    return this.makeRequest({ action: 'services' });
  }

  async addOrder(serviceId: number, link: string, quantity: number): Promise<ApiOrderResponse> {
    return this.makeRequest({
      action: 'add',
      service: serviceId,
      link,
      quantity,
    });
  }

  async getOrderStatus(orderId: number): Promise<ApiOrderStatus> {
    return this.makeRequest({
      action: 'status',
      order: orderId,
    });
  }

  async getBalance(): Promise<{ balance: string; currency: string }> {
    return this.makeRequest({ action: 'balance' });
  }

  async createRefill(orderId: number): Promise<{ refill: string }> {
    return this.makeRequest({
      action: 'refill',
      order: orderId,
    });
  }

  async cancelOrder(orderIds: number[]): Promise<any> {
    return this.makeRequest({
      action: 'cancel',
      orders: orderIds.join(','),
    });
  }
}

export const apiClient = new BaratoSociaisAPI();