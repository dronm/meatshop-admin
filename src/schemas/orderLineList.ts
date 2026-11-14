import * as v from "valibot";

import {
	DateStringSchema,
	IdSchema,
	NumberSchema,
	TextSchema,
} from "@/schemas/common";
import type { OrderLineList } from "@/types/orderLineList";

const referenceSchema = v.object({
	keys: v.object({ id: IdSchema }),
	descr: TextSchema,
});

const ref1CSchema = v.object({
	id: TextSchema,
	descr: TextSchema,
});

const orderLineListSchema = v.object({
	id: IdSchema,
	number_1c: v.nullish(TextSchema, null),
	shipment_number_1c: v.nullish(TextSchema, null),
	for_date: DateStringSchema,
	status: v.nullable(referenceSchema),
	shipment_ref_1c: v.nullable(ref1CSchema),
	customer: v.nullable(referenceSchema),
	cash_payed: v.optional(v.boolean(), false),
	customer_name: v.nullish(TextSchema, null),
	customer_phone: v.nullish(TextSchema, null),
	customer_sale_place: v.nullable(referenceSchema),
	product: v.nullable(referenceSchema),
	quant: NumberSchema,
	requires_weight_confirmation: v.boolean(),
	weight_confirmed: v.boolean(),
	price: v.nullable(NumberSchema),
	amount: v.nullable(NumberSchema),
	vat_amount: v.nullable(NumberSchema),
	use_marking: v.boolean(),
	mercury: v.boolean(),
	item_id: IdSchema,
	line_num: IdSchema,
	ref_1c: v.nullable(ref1CSchema),
	comment_customer: v.nullable(TextSchema),
	comment_admin: v.nullable(TextSchema),
});

export const orderLineListFromDTO = (dto: unknown): OrderLineList => {
	const parsed = v.parse(orderLineListSchema, dto);

	return {
		...parsed,
		for_date: new Date(parsed.for_date),
	};
};
