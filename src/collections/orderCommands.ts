import { type GridCommand } from "@katren/vue-collection-lib";

import { i18n } from "@/i18n";
import type { OrderKey } from "@/types/orderDocument";
import { createOrderShipments } from "@/utils/order1cActions";
import {
	hasOrder1CReference,
	openOrderPrintPopup,
	openShipmentPrintPopup,
} from "@/utils/orderPrintPopup";

interface OrderCommandRow {
	id: number;
	ref_1c: unknown;
}

const commandOrderIDs = (rows: readonly OrderCommandRow[]): number[] | null => {
	if (rows.length === 0) {
		return null;
	}

	// The line projection contains several rows for the same order. Batch 1C
	// endpoints accept each order only once.
	const orders = [...new Map(rows.map((row) => [row.id, row])).values()];
	const missingReferenceIDs = orders
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

	return orders.map((row) => row.id);
};

export const createOrderCommands = <TRow extends OrderCommandRow>(
	includeDelete = false,
): GridCommand<TRow, OrderKey>[] => {
	const commands: GridCommand<TRow, OrderKey>[] = [
		{ name: "create" },
		{ name: "edit" },
		{ name: "copy" },
		{
			name: "printOrder1c",
			labelKey: "Order.actions.printOrder",
			icon: "pi pi-print",
			enabled: (row) => row !== null,
			handler: async ({ rows }): Promise<void> => {
				const orderIDs = commandOrderIDs(rows);
				if (orderIDs !== null) {
					await openOrderPrintPopup(orderIDs);
				}
			},
		},
		{
			name: "createShipments1c",
			labelKey: "Order.actions.createShipment",
			icon: "pi pi-truck",
			enabled: (row) => row !== null,
			handler: async ({ rows }): Promise<void> => {
				const orderIDs = commandOrderIDs(rows);
				if (orderIDs !== null) {
					await createOrderShipments(orderIDs);
				}
			},
		},
		{
			name: "printShipment1c",
			labelKey: "Order.actions.printShipment",
			icon: "pi pi-file-pdf",
			enabled: (row) => row !== null,
			handler: async ({ rows }): Promise<void> => {
				const orderIDs = commandOrderIDs(rows);
				if (orderIDs !== null) {
					await openShipmentPrintPopup(orderIDs);
				}
			},
		},
	];

	if (includeDelete) {
		commands.push({ name: "delete" });
	}
	commands.push({ name: "search" }, { name: "refresh" });
	return commands;
};
