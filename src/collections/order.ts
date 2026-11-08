import {
	defineCollection,
	SortDirect,
	type GridColumn,
} from "@katren/vue-collection-lib";

import { orderListApi } from "@/api/orderDocument";
import { createOrderCommands } from "@/collections/orderCommands";
import { collectionGridOptions } from "@/config/collectionGrid";
import type { OrderKey } from "@/types/orderDocument";
import type { OrderList } from "@/types/orderList.gen";
import { orderStatusClass } from "@/utils/orderStatus";

const formatOrderDateTime = (value: unknown): string => {
	if (!(value instanceof Date)) {
		return "";
	}

	return value.toLocaleString("ru-RU", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatReference = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return "";
	}

	const descr = (value as { descr?: unknown }).descr;
	return typeof descr === "string" ? descr : "";
};

const columns: GridColumn<OrderList>[] = [
	{
		field: "id",
		headerKey: "Order.fields.id",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "5rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "for_date",
		headerKey: "Order.fields.for_date",
		sortable: true,
		dataType: "date",
		format: formatOrderDateTime,
		width: "10rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "number_1c",
		headerKey: "Order.fields.number_1c",
		sortable: true,
		width: "6rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "customer",
		headerKey: "Order.fields.customer",
		sortable: true,
		format: formatReference,
		width: "12rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "customer_sale_place",
		headerKey: "Order.fields.customer_sale_place",
		sortable: true,
		format: formatReference,
		width: "12rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "customer_user",
		headerKey: "Order.fields.customer_user",
		sortable: true,
		format: formatReference,
		width: "8rem",
		bodyClass: orderStatusClass,
	},
	{
		field: "status",
		headerKey: "Order.fields.status",
		sortable: true,
		format: formatReference,
		width: "8rem",
		bodyClass: orderStatusClass,
	},
];

export const orderCollection = defineCollection<OrderList, OrderKey>({
	...collectionGridOptions,
	titleKey: "Order.title",
	api: orderListApi,
	columns,
	commands: createOrderCommands<OrderList>(true),
	dataKey: "id",
	getKey: (row) => ({ id: row.id }),
	routes: {
		create: () => ({ name: "orderCreate" }),
		edit: (row) => ({
			name: "orderEdit",
			params: { id: String(row.id) },
		}),
		copy: (row) => ({
			name: "orderCreate",
			query: { copy_id: String(row.id) },
		}),
	},
	editMode: "page",
	defaultSorter: [{ f: "id", d: SortDirect.DESC }],
	stateKey: "order-grid",
	pageSize: 30,
	showCommandShortcuts: false,
});
