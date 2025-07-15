import { apiClient } from './api';

export const placeOrder = async (serviceId: number, link: string, quantity: number): Promise<number> => {
  try {
    const response = await apiClient.addOrder(serviceId, link, quantity);
    return response.order;
  } catch (error) {
    console.error('Failed to place order:', error);
    throw new Error('Order placement failed');
  }
};

export const getOrderStatus = async (orderId: number): Promise<any> => {
  try {
    return await apiClient.getOrderStatus(orderId);
  } catch (error) {
    console.error('Failed to get order status:', error);
    throw new Error('Order status check failed');
  }
};

export const createRefill = async (orderId: number): Promise<any> => {
  try {
    return await apiClient.createRefill(orderId);
  } catch (error) {
    console.error('Failed to create refill:', error);
    throw new Error('Refill creation failed');
  }
};

export const cancelOrder = async (orderIds: number[]): Promise<any> => {
  try {
    return await apiClient.cancelOrder(orderIds);
  } catch (error) {
    console.error('Failed to cancel order:', error);
    throw new Error('Order cancellation failed');
  }
};

export const getBalance = async (): Promise<{ balance: string; currency: string }> => {
  try {
    return await apiClient.getBalance();
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error('Balance check failed');
  }
};