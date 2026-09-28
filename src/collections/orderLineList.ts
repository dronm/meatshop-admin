import {
	defineCollection,
	SortDirect,
	type GridColumn,
} from "@katren/vue-collection-lib";

import { orderLineListApi } from "@/api/orderLineList";
import { createOrderCommands } from "@/collections/orderCommands";
import type { OrderKey } from "@/types/orderDocument";
import type { OrderLineListRow } from "@/types/orderLineList";
import { formatReference } from "@/utils/reference";

const formatDecimal = (fractionDigits: number) => {
	const formatter = new Intl.NumberFormat("ru-RU", {
		maximumFractionDigits: fractionDigits,
	});
	return (value: unknown): string =>
		typeof value === "number" && Number.isFinite(value)
			? formatter.format(value)
			: "";
};

const format1CReference = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return "";
	}

	const descr = (value as { descr?: unknown }).descr;
	return typeof descr === "string" ? descr : "";
};

const baseColumns: GridColumn<OrderLineListRow>[] = [
	{
		field: "id",
		headerKey: "OrderLineList.fields.id",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "6rem",
	},
	{
		field: "line_num",
		headerKey: "OrderLineList.fields.line_num",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "5rem",
	},
	{
		field: "customer",
		headerKey: "OrderLineList.fields.customer",
		searchable: false,
		format: formatReference,
		width: "12rem",
	},
	{
		field: "customer_sale_place",
		headerKey: "OrderLineList.fields.customer_sale_place",
		searchable: false,
		format: formatReference,
		width: "12rem",
	},
	{
		field: "product",
		headerKey: "OrderLineList.fields.product",
		searchable: false,
		format: formatReference,
		width: "16rem",
	},
	{
		field: "quant",
		headerKey: "OrderLineList.fields.quant",
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(4),
		width: "8rem",
	},
	{
		field: "price",
		headerKey: "OrderLineList.fields.price",
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(6),
		width: "8rem",
	},
	{
		field: "amount",
		headerKey: "OrderLineList.fields.amount",
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(2),
		width: "8rem",
	},
	{
		field: "vat_amount",
		headerKey: "OrderLineList.fields.vat_amount",
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(2),
		width: "8rem",
	},
	{
		field: "use_marking",
		headerKey: "OrderLineList.fields.use_marking",
		sortable: true,
		dataType: "boolean",
		width: "7rem",
	},
	{
		field: "ref_1c",
		headerKey: "OrderLineList.fields.ref_1c",
		searchable: false,
		format: format1CReference,
		width: "10rem",
	},
	{
		field: "shipment_ref_1c",
		headerKey: "OrderLineList.fields.shipment_ref_1c",
		searchable: false,
		format: format1CReference,
		width: "10rem",
	},
];

const columns: GridColumn<OrderLineListRow>[] = baseColumns.map((column) => ({
	...column,
	bodyClass: (row: OrderLineListRow): string =>
		row.group_start ? "order-line-group-start" : "",
}));

export const orderLineCollection = defineCollection<OrderLineListRow, OrderKey>(
	{
		titleKey: "OrderLineList.title",
		api: orderLineListApi,
		columns,
		commands: createOrderCommands<OrderLineListRow>(),
		dataKey: "item_id",
		getKey: (row) => ({ id: row.id }),
		routes: {
			create: () => ({
				name: "orderCreate",
				query: { from: "orderLines" },
			}),
			edit: (row) => ({
				name: "orderEdit",
				params: { id: String(row.id) },
				query: { from: "orderLines" },
			}),
			copy: (row) => ({
				name: "orderCreate",
				query: {
					copy_id: String(row.id),
					from: "orderLines",
				},
			}),
		},
		editMode: "page",
		defaultSorter: [
			{ f: "id", d: SortDirect.DESC },
			{ f: "line_num", d: SortDirect.ASC },
			{ f: "item_id", d: SortDirect.ASC },
		],
		stateKey: "order-lines-grid",
		pageSize: 30,
		showCommandShortcuts: false,
	},
);
