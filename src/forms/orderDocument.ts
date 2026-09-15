import type { CollectionFormMode } from "@katren/vue-collection-lib";

import type {
	OrderDetail,
	OrderDocument,
	OrderDocumentItem,
	OrderFormModel,
} from "@/types/orderDocument";
import { normalizeRef1C } from "@/utils/ref1c";

const optionalText = (value: string | null | undefined): string | null => {
	const normalized = value?.trim() ?? "";
	return normalized.length > 0 ? normalized : null;
};

const optionalID = (value: number | null | undefined): number | null => {
	return typeof value === "number" && Number.isInteger(value) && value > 0
		? value
		: null;
};

const copiedItems = (items: OrderDetail["items"]): OrderDocumentItem[] => {
	return items.map((item, index) => ({
		id: -(index + 1),
		line_num: index + 1,
		product_id: item.product_id,
		measure_unit_id: item.measure_unit_id,
		quant_required: item.quant_required,
		quant: item.quant,
	}));
};

export const createOrderDocumentFormModel = (): OrderFormModel => ({
	id: 0,
	version: 0,
	for_date: new Date(),
	number_1c: null,
	ref_1c: null,
	customer_id: 0,
	customer: null,
	customer_sale_place_id: 0,
	customer_sale_place: null,
	customer_user_id: null,
	customer_user: null,
	status_id: null,
	status: null,
	comment_customer: null,
	comment_admin: null,
	items: [],
});

export const orderDocumentToFormModel = (
	detail: OrderDetail,
): OrderFormModel => ({
	id: detail.id,
	version: detail.version,
	for_date: detail.for_date,
	number_1c: detail.number_1c,
	ref_1c: detail.ref_1c,
	customer_id: detail.customer_id,
	customer: detail.customer,
	customer_sale_place_id: detail.customer_sale_place_id,
	customer_sale_place: detail.customer_sale_place,
	customer_user_id: detail.customer_user_id,
	customer_user: detail.customer_user,
	status_id: detail.status_id,
	status: detail.status,
	comment_customer: detail.comment_customer,
	comment_admin: detail.comment_admin,
	items: detail.items.map((item) => ({
		id: item.id,
		line_num: item.line_num,
		product_id: item.product_id,
		measure_unit_id: item.measure_unit_id,
		quant_required: item.quant_required,
		quant: item.quant,
	})),
});

export const copyOrderDocumentFormModel = (
	detail: OrderDetail,
): OrderFormModel => ({
	...orderDocumentToFormModel(detail),
	id: 0,
	version: 0,
	number_1c: null,
	ref_1c: null,
	items: copiedItems(detail.items),
} as OrderFormModel);

export const orderFormModelToDocument = (
	form: OrderFormModel,
	mode: CollectionFormMode,
): OrderDocument => {
	const isEdit = mode === "edit";
	const items = [...form.items]
		.map((item, index) => ({
			...item,
			line_num: Number.isFinite(item.line_num)
				? Math.trunc(item.line_num)
				: index + 1,
		}))
		.sort((left, right) => left.line_num - right.line_num)
		.map((item, index) => ({
			id: isEdit && item.id > 0 ? item.id : 0,
			line_num: index + 1,
			product_id: item.product_id,
			measure_unit_id: item.measure_unit_id,
			quant_required: item.quant_required,
			quant: item.quant,
		}));

	return {
		id: isEdit ? form.id : 0,
		version: isEdit ? form.version : 0,
		for_date: form.for_date as Date,
		number_1c: optionalText(form.number_1c),
		ref_1c: normalizeRef1C(form.ref_1c),
		customer_id: form.customer_id ?? 0,
		customer_sale_place_id: form.customer_sale_place_id ?? 0,
		customer_user_id: optionalID(form.customer_user_id),
		status_id: optionalID(form.status_id),
		comment_customer: optionalText(form.comment_customer),
		comment_admin: optionalText(form.comment_admin),
		items,
	};
};
