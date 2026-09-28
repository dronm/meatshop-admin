import * as v from "valibot";

import { IdSchema, NumberSchema, TextSchema } from "@/schemas/common";
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
	shipment_ref_1c: v.nullable(ref1CSchema),
	customer: v.nullable(referenceSchema),
	customer_sale_place: v.nullable(referenceSchema),
	product: v.nullable(referenceSchema),
	quant: NumberSchema,
	price: v.nullable(NumberSchema),
	amount: v.nullable(NumberSchema),
	vat_amount: v.nullable(NumberSchema),
	use_marking: v.boolean(),
	item_id: IdSchema,
	line_num: IdSchema,
	ref_1c: v.nullable(ref1CSchema),
});

export const orderLineListFromDTO = (dto: unknown): OrderLineList => {
	return v.parse(orderLineListSchema, dto);
};
