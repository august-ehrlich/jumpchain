import { apiClient } from "./client";
import type { Jumper, Build } from "../types/jumper";

export const jumperApi = {
	getAll: async (): Promise<Jumper[]> => {
		const response = await apiClient.get("/jumpers/");
		return response.data;
	},
	get: async (id: number): Promise<Jumper> => {
		const response = await apiClient.get(`/jumpers/${id}`);
		return response.data;
	},
	create: async (name: string): Promise<Jumper> => {
		const response = await apiClient.post("/jumpers/", { name });
		return response.data;
	},
	delete: async (id: number): Promise<void> => {
		await apiClient.delete(`/jumpers/${id}`);
	},
	createBuild: async (
		jumperId: number,
		documentId: number,
		traitIds: number[],
	): Promise<Build> => {
		const response = await apiClient.post(`/jumpers/${jumperId}/builds`, {
			jumper_id: jumperId,
			document_id: documentId,
			trait_ids: traitIds,
		});
		return response.data;
	},
	updateBuild: async (
		jumperId: number,
		buildId: number,
		traitIds: number[],
	): Promise<Build> => {
		const response = await apiClient.put(
			`/jumpers/${jumperId}/builds/${buildId}`,
			{
				trait_ids: traitIds,
			},
		);
		return response.data;
	},
	deleteBuild: async (jumperId: number, buildId: number): Promise<void> => {
		await apiClient.delete(`/jumpers/${jumperId}/builds/${buildId}`);
	},
};
