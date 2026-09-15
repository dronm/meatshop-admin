import api from "@/api/http";

export interface Integration1CNomenclatureItem {
	id: string;
	name: string;
}

export interface Integration1CCounterpartyItem {
	id: string;
	name: string;
	inn: string;
}

const complete = async <T>(endpoint: string, name: string): Promise<T[]> => {
	const query = new URLSearchParams({
		name,
	});

	return await api.get<T[]>(`${endpoint}?${query.toString()}`);
};

export const integration1cApi = {
	completeNomenclature: async (
		name: string,
	): Promise<Integration1CNomenclatureItem[]> => {
		return await complete<Integration1CNomenclatureItem>(
			"/integration-1c/nomenclature",
			name,
		);
	},
	completeCounterparties: async (
		name: string,
	): Promise<Integration1CCounterpartyItem[]> => {
		return await complete<Integration1CCounterpartyItem>(
			"/integration-1c/counterparties",
			name,
		);
	},
};
