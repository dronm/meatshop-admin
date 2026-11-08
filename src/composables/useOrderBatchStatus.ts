import { ref } from "vue";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";

import type { OrderStatusChangeHandler } from "@/collections/orderCommands";
import { i18n } from "@/i18n";

export const useOrderBatchStatus = () => {
	const statusDialogVisible = ref(false);
	const statusOrderIDs = ref<number[]>([]);
	const suggestedStatusID = ref<number | null>(null);
	let reloadCollection: (() => Promise<void>) | null = null;

	const openStatusDialog: OrderStatusChangeHandler = (
		orderIDs,
		reload,
		initialStatusID,
	): void => {
		statusOrderIDs.value = [...new Set(orderIDs)];
		suggestedStatusID.value = initialStatusID;
		reloadCollection = reload;
		statusDialogVisible.value = true;
	};

	const statusChanged = async (): Promise<void> => {
		statusDialogVisible.value = false;
		try {
			await reloadCollection?.();
		} catch (error: unknown) {
			window.alert(
				`${String(i18n.global.t("Order.batchStatus.refreshFailed"))}\n${errorText(error)}`,
			);
		}
	};

	return {
		statusDialogVisible,
		statusOrderIDs,
		suggestedStatusID,
		openStatusDialog,
		statusChanged,
	};
};
