import { errorText } from "@katren/vue-collection-lib/utils/errorText";

import { orderDocumentApi } from "@/api/orderDocument";
import { showOrder1CFeedback } from "@/composables/useOrder1CFeedback";
import { i18n } from "@/i18n";

const translate = (
	key: string,
	params: Record<string, string | number> = {},
): string => {
	return String(i18n.global.t(key, params));
};

const order1CErrorText = (error: unknown): string => {
	const message = errorText(error);
	if (/order customer has no 1c reference/i.test(message)) {
		return translate("Order.feedback.missingCustomer1cReference");
	}
	if (/order product has no 1c reference/i.test(message)) {
		return translate("Order.feedback.missingProduct1cReference");
	}
	if (/orders have no 1c reference/i.test(message)) {
		return translate("Order.feedback.missingOrder1cReference");
	}
	return message;
};

export const createOrderShipments = async (
	orderIDs: readonly number[],
): Promise<void> => {
	try {
		const result =
			await orderDocumentApi.createShipments1c(orderIDs);
		showOrder1CFeedback({
			title: translate("Order.actions.createShipment"),
			severity: "success",
			message: translate(
				"Order.feedback.createShipmentAccepted",
				{
					jobId: result.job_id,
					status: translate(
						`Integration1CJob.status.${result.status}`,
					),
				},
			),
		});
	} catch (error: unknown) {
		showOrder1CFeedback({
			title: translate("Order.actions.createShipment"),
			severity: "error",
			message: `${translate("Order.feedback.createShipmentFailed")}\n${order1CErrorText(error)}`,
		});
	}
};

export const createOrdersIn1C = async (
	orderIDs: readonly number[],
): Promise<void> => {
	try {
		const result = await orderDocumentApi.createOrders1c(orderIDs);
		showOrder1CFeedback({
			title: translate("Order.actions.createOrder"),
			severity: "success",
			message: translate(
				"Order.feedback.createOrderAccepted",
				{
					jobId: result.job_id,
					status: translate(
						`Integration1CJob.status.${result.status}`,
					),
				},
			),
		});
	} catch (error: unknown) {
		showOrder1CFeedback({
			title: translate("Order.actions.createOrder"),
			severity: "error",
			message: `${translate("Order.feedback.createOrderFailed")}\n${order1CErrorText(error)}`,
		});
	}
};
