import {
	buildCollectionQuery,
	normalizeCollectionResponse,
	type CollectionParams,
	type CollectionResponse,
} from "@katren/vue-collection-lib";

import api from "@/api/http";
import { orderLineListFromDTO } from "@/schemas/orderLineList";
import type { OrderLineListRow } from "@/types/orderLineList";

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

export const orderLineListApi = {
	serviceName: "Order",
	list,
};
