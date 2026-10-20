import api from "@/api/http";

export type Integration1CAdminCommand = "health" | "status" | "stop" | "start";

export interface Integration1CAdminResponse {
	status_code: number;
	body: unknown;
}

export const integration1cAdminApi = {
	run: async (
		command: Integration1CAdminCommand,
	): Promise<Integration1CAdminResponse> => {
		const endpoint = `/integration-1c/${command}`;
		// COM start/stop can take longer than the application's default 1s timeout.
		const options = { timeout: 0 };
		if (command === "health" || command === "status") {
			return await api.get<Integration1CAdminResponse>(
				endpoint,
				{ _: Date.now() },
				options,
			);
		}
		return await api.post<Integration1CAdminResponse>(
			endpoint,
			{},
			options,
		);
	},
};
