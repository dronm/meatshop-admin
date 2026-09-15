import {
	buildCollectionQuery,
	normalizeCollectionResponse,
	type CollectionParams,
	type CollectionResponse,
} from "@katren/vue-collection-lib";

import api from "@/api/http";
import { orderDetailFromDTO } from "@/schemas/orderDocument";
import { orderListFromDTO } from "@/schemas/orderList.gen";
import type {
	OrderDetail,
	OrderDocument,
	OrderKey,
} from "@/types/orderDocument";
import type {
	OrderList,
	OrderListDTO,
} from "@/types/orderList.gen";

const ORDER_PRINT_TIMEOUT = 60_000;
const basePath = "/order";

const list = async (
	params?: CollectionParams,
): Promise<CollectionResponse<OrderList>> => {
	const response = await api.get<unknown>(
		basePath,
		buildCollectionQuery(params),
	);
	const collection = normalizeCollectionResponse<OrderListDTO>(response);

	return {
		rows: collection.rows.map(orderListFromDTO),
		agg: collection.agg,
	};
};

const remove = async (key: OrderKey): Promise<unknown> => {
	return await api.delete(`${basePath}/${key.id}`);
};

export const orderListApi = {
	serviceName: "Order",
	list,
	delete: remove,
};

export const orderDocumentApi = {
	list,
	detail: async (key: OrderKey): Promise<OrderDetail> => {
		const dto = await api.get<unknown>(`${basePath}/${key.id}`);
		return orderDetailFromDTO(dto);
	},
	create: async (document: OrderDocument): Promise<OrderDetail> => {
		const dto = await api.post<unknown>(basePath, document);
		return orderDetailFromDTO(dto);
	},
	update: async (
		key: OrderKey,
		document: OrderDocument,
	): Promise<OrderDetail> => {
		const dto = await api.put<unknown>(`${basePath}/${key.id}`, document);
		return orderDetailFromDTO(dto);
	},
	delete: remove,
	print1c: async (key: OrderKey): Promise<Blob> => {
		return await api.getAttachment(
			`${basePath}/${key.id}/print-1c`,
			{ timeout: ORDER_PRINT_TIMEOUT },
		);
	},
};
