import { apiClient } from './client';
import { Document } from '../types/document'; // Import the type

export const documentApi = {
  get: async (id: number): Promise<Document> => {
    const response = await apiClient.get(`/document/${id}`);
    return response.data;
  },

  create: async (data: Omit<Document, 'id'>): Promise<Document> => {
    const response = await apiClient.post('/document/', data);
    return response.data;
  },

  getAll: async (): Promise<Document[]> => {
    const response = await apiClient.get('/document/');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/document/${id}`);
  },
};