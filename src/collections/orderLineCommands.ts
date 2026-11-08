import type { GridCommand } from "@katren/vue-collection-lib";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";

import { orderLineListApi } from "@/api/orderLineList";
import {
	createOrderCommands,
	type OrderStatusChangeHandler,
} from "@/collections/orderCommands";
import { i18n } from "@/i18n";
import type { OrderKey } from "@/types/orderDocument";
import type { OrderLineListRow } from "@/types/orderLineList";

export type OrderLineRemovalConfirmation = (count: number) => Promise<boolean>;

export const createOrderLineCommands = (
	changeStatus?: OrderStatusChangeHandler,
	confirmRemove?: OrderLineRemovalConfirmation,
): GridCommand<OrderLineListRow, OrderKey>[] => {
	const commands = createOrderCommands<OrderLineListRow>(false, changeStatus);
	let removing = false;
	const removeLines: GridCommand<OrderLineListRow, OrderKey> = {
		name: "delete",
		labelKey: "OrderLineList.actions.remove",
		icon: "pi pi-trash",
		enabled: (row) => row !== null && confirmRemove !== undefined,
		runDefault: false,
		handler: async ({ rows, clearMarkedRows, reload }): Promise<void> => {
			if (removing || confirmRemove === undefined) {
				return;
			}
			const itemIDs = [...new Set(rows.map((row) => row.item_id))];
			if (itemIDs.length === 0) {
				return;
			}

			removing = true;
			try {
				if (!(await confirmRemove(itemIDs.length))) {
					return;
				}
				try {
					await orderLineListApi.removeLines(itemIDs);
				} catch (error: unknown) {
					window.alert(
						`${String(i18n.global.t("OrderLineList.feedback.removeFailed"))}\n${errorText(error)}`,
					);
					return;
				}

				clearMarkedRows();
				try {
					await reload();
				} catch (error: unknown) {
					window.alert(
						`${String(i18n.global.t("OrderLineList.feedback.refreshFailed"))}\n${errorText(error)}`,
					);
				}
			} finally {
				removing = false;
			}
		},
	};
	const searchIndex = commands.findIndex((command) => command.name === "search");
	commands.splice(searchIndex < 0 ? commands.length : searchIndex, 0, removeLines);
	return commands;
};
