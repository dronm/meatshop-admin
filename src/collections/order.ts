import {
	defineCollection,
	SortDirect,
	type GridCommand,
	type GridColumn,
} from "@katren/vue-collection-lib";

import { orderListApi } from "@/api/orderDocument";
import { i18n } from "@/i18n";
import type { OrderKey } from "@/types/orderDocument";
import type { OrderList } from "@/types/orderList.gen";
import { createOrderShipments } from "@/utils/order1cActions";
import {
	hasOrder1CReference,
	openOrderPrintPopup,
	openShipmentPrintPopup,
} from "@/utils/orderPrintPopup";

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

const referenceID = (value: unknown): number | null => {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const keys = (value as { keys?: unknown }).keys;
	if (keys === null || typeof keys !== "object" || Array.isArray(keys)) {
		return null;
	}

	const id = (keys as { id?: unknown }).id;
	return typeof id === "number" && Number.isInteger(id) && id > 0
		? id
		: null;
};

const orderStatusClass = (row: OrderList): string => {
	switch (referenceID(row.status)) {
		case 1:
			return "order-status-new";
		case 2:
			return "order-status-accepted";
		case 3:
			return "order-status-processing";
		case 4:
			return "order-status-approved";
		case 5:
			return "order-status-completed";
		case 6:
			return "order-status-cancelled";
		default:
			return "";
	}
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

const commandOrderIDs = (rows: readonly OrderList[]): number[] | null => {
	if (rows.length === 0) {
		return null;
	}

	const missingReferenceIDs = rows
		.filter((row) => !hasOrder1CReference(row.ref_1c))
		.map((row) => row.id);

	if (missingReferenceIDs.length > 0) {
		window.alert(
			String(
				i18n.global.t(
					"Order.feedback.missing1cReferences",
					{
						ids: missingReferenceIDs.join(
							", ",
						),
					},
				),
			),
		);
		return null;
	}

	return rows.map((row) => row.id);
};

const printOrderCommand: GridCommand<OrderList, OrderKey> = {
	name: "printOrder1c",
	labelKey: "Order.actions.printOrder",
	icon: "pi pi-print",
	enabled: (row) => row !== null,
	handler: async ({ rows }): Promise<void> => {
		const orderIDs = commandOrderIDs(rows);
		if (orderIDs === null) {
			return;
		}

		await openOrderPrintPopup(orderIDs);
	},
};

const createShipmentsCommand: GridCommand<OrderList, OrderKey> = {
	name: "createShipments1c",
	labelKey: "Order.actions.createShipment",
	icon: "pi pi-truck",
	enabled: (row) => row !== null,
	handler: async ({ rows }): Promise<void> => {
		const orderIDs = commandOrderIDs(rows);
		if (orderIDs === null) {
			return;
		}

		await createOrderShipments(orderIDs);
	},
};

const printShipmentCommand: GridCommand<OrderList, OrderKey> = {
	name: "printShipment1c",
	labelKey: "Order.actions.printShipment",
	icon: "pi pi-file-pdf",
	enabled: (row) => row !== null,
	handler: async ({ rows }): Promise<void> => {
		const orderIDs = commandOrderIDs(rows);
		if (orderIDs === null) {
			return;
		}

		await openShipmentPrintPopup(orderIDs);
	},
};

const commands: GridCommand<OrderList, OrderKey>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "copy" },
	printOrderCommand,
	createShipmentsCommand,
	printShipmentCommand,
	{ name: "delete" },
	{ name: "search" },
	{ name: "refresh" },
];

export const orderCollection = defineCollection<OrderList, OrderKey>({
	titleKey: "Order.title",
	api: orderListApi,
	columns,
	commands,
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
	defaultSorter: [{ f: "for_date", d: SortDirect.DESC }],
	stateKey: "order-grid",
	pageSize: 30,
	showCommandShortcuts: false,
});
