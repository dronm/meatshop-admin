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
	Order1CJobResponse,
	OrderKey,
} from "@/types/orderDocument";
import type {
	OrderList,
	OrderListDTO,
} from "@/types/orderList.gen";

const ORDER_PRINT_TIMEOUT = 60_000;
const basePath = "/order";

const orderIDsRequest = (
	orderIDs: readonly number[],
): { order_ids: number[] } => {
	if (
		orderIDs.length === 0 ||
		orderIDs.some((id) => !Number.isInteger(id) || id <= 0)
	) {
		throw new Error("Не выбраны заказы для выполнения команды.");
	}

	return { order_ids: [...orderIDs] };
};

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
	printOrders1c: async (orderIDs: readonly number[]): Promise<Blob> => {
		return await api.postAttachment(
			`${basePath}/print-1c`,
			orderIDsRequest(orderIDs),
			{ timeout: ORDER_PRINT_TIMEOUT },
		);
	},
	createShipments1c: async (
		orderIDs: readonly number[],
	): Promise<Order1CJobResponse> => {
		return await api.post<Order1CJobResponse>(
			`${basePath}/create-shipments-1c`,
			orderIDsRequest(orderIDs),
		);
	},
	printShipments1c: async (
		orderIDs: readonly number[],
	): Promise<Blob> => {
		return await api.postAttachment(
			`${basePath}/print-shipment-1c`,
			orderIDsRequest(orderIDs),
			{ timeout: ORDER_PRINT_TIMEOUT },
		);
	},
};
