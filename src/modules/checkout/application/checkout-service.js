import { apiClient } from '../../../shared/api/client.js';

export async function calculateShipping({ toZip, totalItems, insuranceValueCents }) {
  const response = await apiClient.post('/shipping/calculate', { toZip, totalItems, insuranceValueCents });
  return response.data;
}

export async function createOrder(address, paymentProvider, paymentMethod, shipping) {
  const response = await apiClient.post('/orders', {
    address,
    paymentProvider,
    paymentMethod,
    shipping,
  });
  return response.data;
}
