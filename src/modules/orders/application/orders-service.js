import { apiClient } from '../../../shared/api/client.js';

export async function getOrders() {
  const response = await apiClient.get('/orders');
  return response.data;
}

export async function getOrder(id) {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
}
