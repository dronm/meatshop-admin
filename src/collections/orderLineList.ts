import {
	defineCollection,
	SortDirect,
	type GridColumn,
} from "@katren/vue-collection-lib";

import { orderLineListApi } from "@/api/orderLineList";
import { createOrderLineCommands } from "@/collections/orderLineCommands";
import {
	createCustomerSalePlaceReference,
	customerReference,
} from "@/references/customerReferences";
import { productReference } from "@/references/productReferences";
import type { OrderKey } from "@/types/orderDocument";
import type { OrderLineListRow } from "@/types/orderLineList";
import { formatReference } from "@/utils/reference";
import { orderStatusClass } from "@/utils/orderStatus";

const customerSalePlaceReference = createCustomerSalePlaceReference();

const formatOrderDate = (value: unknown): string =>
	value instanceof Date ? value.toLocaleDateString("ru-RU") : "";

const formatDecimal = (fractionDigits: number) => {
	const formatter = new Intl.NumberFormat("ru-RU", {
		maximumFractionDigits: fractionDigits,
	});
	return (value: unknown): string =>
		typeof value === "number" && Number.isFinite(value)
			? formatter.format(value)
			: "";
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
		field: "for_date",
		headerKey: "OrderLineList.fields.for_date",
		sortable: true,
		dataType: "date",
		format: formatOrderDate,
		width: "9rem",
	},
	{
		field: "status",
		headerKey: "OrderLineList.fields.status",
		searchField: "status->>'descr'",
		format: formatReference,
		width: "8rem",
	},
	{
		field: "customer",
		headerKey: "OrderLineList.fields.customer",
		searchDataType: "reference",
		reference: customerReference,
		searchField: "customer->'keys'->>'id'",
		format: formatReference,
		width: "12rem",
	},
	{
		field: "customer_sale_place",
		headerKey: "OrderLineList.fields.customer_sale_place",
		searchDataType: "reference",
		reference: customerSalePlaceReference,
		searchField: "customer_sale_place->'keys'->>'id'",
		format: formatReference,
		width: "12rem",
	},
	{
		field: "product",
		headerKey: "OrderLineList.fields.product",
		searchDataType: "reference",
		reference: productReference,
		searchField: "product->'keys'->>'id'",
		format: formatReference,
		width: "16rem",
	},
	{
		field: "quant",
		headerKey: "OrderLineList.fields.quant",
		searchable: false,
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(4),
		width: "8rem",
	},
	{
		field: "price",
		headerKey: "OrderLineList.fields.price",
		searchable: false,
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(6),
		width: "8rem",
	},
	{
		field: "amount",
		headerKey: "OrderLineList.fields.amount",
		searchable: false,
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(2),
		width: "8rem",
	},
	{
		field: "vat_amount",
		headerKey: "OrderLineList.fields.vat_amount",
		searchable: false,
		sortable: true,
		dataType: "number",
		align: "right",
		format: formatDecimal(2),
		width: "8rem",
	},
	{
		field: "use_marking",
		headerKey: "OrderLineList.fields.use_marking",
		searchable: false,
		sortable: true,
		dataType: "boolean",
		align: "center",
		format: (value: unknown): string => value === true ? "да" : "нет",
		width: "4.5rem",
	},
	{
		field: "mercury",
		headerKey: "OrderLineList.fields.mercury",
		searchable: false,
		dataType: "boolean",
		align: "center",
		width: "7rem",
	},
	{
		field: "number_1c",
		headerKey: "OrderLineList.fields.number_1c",
		width: "10rem",
	},
	{
		field: "shipment_number_1c",
		headerKey: "OrderLineList.fields.shipment_number_1c",
		width: "10rem",
	},
	{
		field: "comment_customer",
		headerKey: "OrderLineList.fields.comment_customer",
		sortable: false,
		dataType: "string",
		align: "left",
		width: "6rem",
	},
	{
		field: "comment_admin",
		headerKey: "OrderLineList.fields.comment_admin",
		sortable: false,
		dataType: "string",
		align: "left",
		width: "6rem",
	},
];

const columns: GridColumn<OrderLineListRow>[] = baseColumns.map((column) => ({
	...column,
	bodyClass: (row: OrderLineListRow): string =>
		[
			orderStatusClass(row),
			row.group_start ? "order-line-group-start" : "",
		]
			.filter(Boolean)
			.join(" "),
}));

export const orderLineCollection = defineCollection<OrderLineListRow, OrderKey>(
	{
		titleKey: "OrderLineList.title",
		api: orderLineListApi,
		stickyHeader: true,
		resizableColumns: true,
		columnResizeMode: "expand",
		columns,
		commands: createOrderLineCommands(),
		dataKey: "item_id",
		getKey: (row) => ({ id: row.item_id }),
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
