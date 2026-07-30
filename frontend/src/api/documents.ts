import { apiClient } from "./client";
import type { Document } from "../types/document"; // Import the type

export const documentApi = {
	get: async (id: number): Promise<Document> => {
		const response = await apiClient.get(`/documents/${id}`);
		return response.data;
	},

	create: async (data: Omit<Document, "id">): Promise<Document> => {
		const response = await apiClient.post("/documents/", data);
		return response.data;
	},

	getAll: async (): Promise<Document[]> => {
		const response = await apiClient.get("/documents/");
		return response.data;
	},

	delete: async (id: number): Promise<void> => {
		await apiClient.delete(`/documents/${id}`);
	},

	update: async (id: number, data: Partial<Document>): Promise<Document> => {
		const response = await apiClient.put(`/documents/${id}`, data);
		return response.data;
	},
};
