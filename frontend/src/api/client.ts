import axios from "axios";
import { toast } from "sonner";

// Create a centralized instance so you don't have to type the URL everywhere
export const apiClient = axios.create({
	baseURL: "http://localhost:8000",
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const backendMessage = error.response?.data?.detail;

		if (backendMessage) {
			toast.error(backendMessage);
		} else if (error.message === "Network Error") {
			toast.error("Cannot connect to the server. Is the backend running?");
		} else {
			toast.error(`An unexpected error occurred: ${error.message}`);
		}

		return Promise.reject(error);
	},
);
