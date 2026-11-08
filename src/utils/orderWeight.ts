import type { OrderFormItem } from "@/types/orderDocument";

export const isWeightConfirmationPending = (item: {
	quant: number;
	requires_weight_confirmation: boolean | null;
	weight_confirmed: boolean;
}): boolean => item.quant > 0
	&& item.requires_weight_confirmation !== false
	&& !item.weight_confirmed;

export const normalizeOrderItemWeight = (
	item: OrderFormItem,
	previous?: OrderFormItem,
): OrderFormItem => {
	const identityChanged = previous !== undefined && (
		item.product_id !== previous.product_id
		|| item.measure_unit_id !== previous.measure_unit_id
	);
	const requestedChanged = previous !== undefined
		&& item.quant_required !== previous.quant_required;
	let confirmed = item.weight_confirmation_requested || item.weight_confirmed;
	if (identityChanged || requestedChanged) {
		confirmed = item.weight_confirmation_requested;
	} else if (previous !== undefined && item.quant !== previous.quant) {
		confirmed = true;
	}
	if (item.requires_weight_confirmation === false) {
		confirmed = true;
	}
	return {
		...item,
		weight_confirmed: confirmed,
		weight_confirmation_requested: false,
	};
};
