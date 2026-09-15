import { errorText } from "@katren/vue-collection-lib/utils/errorText";

import { orderDocumentApi } from "@/api/orderDocument";
import { i18n } from "@/i18n";

const translate = (
	key: string,
	params: Record<string, string | number> = {},
): string => {
	return String(i18n.global.t(key, params));
};

export const createOrderShipments = async (
	orderIDs: readonly number[],
): Promise<void> => {
	try {
		const result =
			await orderDocumentApi.createShipments1c(orderIDs);
		window.alert(
			translate("Order.feedback.createShipmentAccepted", {
				jobId: result.job_id,
				status: translate(`Integration1CJob.status.${result.status}`),
			}),
		);
	} catch (error: unknown) {
		window.alert(
			`${translate("Order.feedback.createShipmentFailed")}\n${errorText(error)}`,
		);
	}
};
