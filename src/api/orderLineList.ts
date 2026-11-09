import {
	buildCollectionQuery,
	normalizeCollectionResponse,
	type CollectionParams,
	type CollectionResponse,
} from "@katren/vue-collection-lib";

import api from "@/api/http";
import { orderLineListFromDTO } from "@/schemas/orderLineList";
import type {
	OrderLineListRow,
	OrderLinesMutationResponse,
} from "@/types/orderLineList";

const list = async (
	params?: CollectionParams,
): Promise<CollectionResponse<OrderLineListRow>> => {
	const response = await api.get<unknown>(
		"/order/lines",
		buildCollectionQuery(params),
	);
	const collection = normalizeCollectionResponse<unknown>(response);
	const lines = collection.rows.map(orderLineListFromDTO);

	return {
		rows: lines.map((line, index) => ({
			...line,
			group_start:
				index === 0 || line.id !== lines[index - 1]?.id,
		})),
		agg: collection.agg,
	};
};

const removeLines = async (
	itemIDs: readonly number[],
): Promise<OrderLinesMutationResponse> => {
	if (
		itemIDs.length === 0 ||
		itemIDs.some((id) => !Number.isInteger(id) || id <= 0)
	) {
		throw new Error("Не выбраны позиции заказа для удаления.");
	}

	return await api.post<OrderLinesMutationResponse>("/order/remove-lines", {
		item_ids: [...new Set(itemIDs)],
	});
};

const toggleMercury = async (
	itemIDs: readonly number[],
): Promise<OrderLinesMutationResponse> => {
	if (
		itemIDs.length === 0 ||
		itemIDs.some((id) => !Number.isInteger(id) || id <= 0)
	) {
		throw new Error("Не выбраны позиции заказа для отметки «Меркурий».");
	}

	return await api.post<OrderLinesMutationResponse>("/order/toggle-lines-mercury", {
		item_ids: [...new Set(itemIDs)],
	});
};

export const orderLineListApi = {
	serviceName: "Order",
	list,
	removeLines,
	toggleMercury,
};
