import type { GridCommand } from "@katren/vue-collection-lib";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";
import { ref } from "vue";

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
	const togglingMercury = ref(false);
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
	const toggleMercury: GridCommand<OrderLineListRow, OrderKey> = {
		name: "toggleMercury",
		labelKey: "OrderLineList.actions.toggleMercury",
		icon: "pi pi-check-square",
		enabled: (row) => row !== null && !togglingMercury.value,
		handler: async ({ rows, reload }): Promise<void> => {
			if (togglingMercury.value || rows.length === 0) {
				return;
			}

			togglingMercury.value = true;
			try {
				try {
					await orderLineListApi.toggleMercury(rows.map((row) => row.item_id));
				} catch (error: unknown) {
					window.alert(
						`${String(i18n.global.t("OrderLineList.feedback.toggleMercuryFailed"))}\n${errorText(error)}`,
					);
					return;
				}

				try {
					await reload();
				} catch (error: unknown) {
					window.alert(
						`${String(i18n.global.t("OrderLineList.feedback.toggleMercuryRefreshFailed"))}\n${errorText(error)}`,
					);
				}
			} finally {
				togglingMercury.value = false;
			}
		},
	};
	const searchIndex = commands.findIndex((command) => command.name === "search");
	commands.splice(searchIndex < 0 ? commands.length : searchIndex, 0, removeLines, toggleMercury);
	return commands;
};
