import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";

import type { OrderLineRemovalConfirmation } from "@/collections/orderLineCommands";

export const useOrderLineRemovalConfirmation = () => {
	const confirmation = useConfirm();
	const { t } = useI18n();
	let cancelPending: (() => void) | null = null;

	const confirmRemoveLines: OrderLineRemovalConfirmation = (count) => {
		if (cancelPending !== null) {
			return Promise.resolve(false);
		}
		return new Promise<boolean>((resolve) => {
			let settled = false;
			const finish = (accepted: boolean): void => {
				if (settled) {
					return;
				}
				settled = true;
				cancelPending = null;
				resolve(accepted);
			};
			cancelPending = () => finish(false);
			confirmation.require({
				group: "order-line-remove",
				message: t("OrderLineList.feedback.confirmRemove", { count }),
				acceptLabel: t("Grid.commands.delete"),
				rejectLabel: t("Grid.commands.cancel"),
				acceptProps: { severity: "danger" },
				rejectProps: { severity: "secondary" },
				accept: () => finish(true),
				reject: () => finish(false),
				onHide: () => finish(false),
			});
		});
	};

	onBeforeUnmount(() => cancelPending?.());

	return { confirmRemoveLines };
};
