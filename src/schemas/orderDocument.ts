import * as v from "valibot";

import { parseWithSchema } from "@katren/vue-collection-lib";

import {
	createCommonSchemas,
	defaultTranslate,
	type TranslateFn,
} from "@/schemas/common";
import type {
	OrderDetail,
	OrderDocument,
} from "@/types/orderDocument";

export const createOrderDocumentSchemas = (t: TranslateFn) => {
	const {
		DateStringSchema,
		IdSchema,
		IntSchema,
		NumberSchema,
		TextSchema,
	} = createCommonSchemas(t);

	const NonNegativeIntSchema = v.pipe(
		IntSchema,
		v.minValue(0, t("validation.minVal", { minVal: 0 })),
	);
	const PositiveNumberSchema = v.pipe(
		NumberSchema,
		v.minValue(Number.MIN_VALUE, t("validation.minVal", { minVal: 0 })),
	);
	const IDReferenceSchema = v.object({
		keys: v.object({
			id: IdSchema,
		}),
		descr: TextSchema,
	});
	const Ref1CSchema = v.object({
		id: TextSchema,
		descr: TextSchema,
	});
	const OrderDocumentItemSchema = v.object({
		id: NonNegativeIntSchema,
		line_num: IdSchema,
		product_id: IdSchema,
		measure_unit_id: IdSchema,
		quant_required: PositiveNumberSchema,
		quant: NumberSchema,
	});
	const OrderDetailItemDTOSchema = v.object({
		id: IdSchema,
		line_num: IdSchema,
		product_id: IdSchema,
		product: v.nullable(IDReferenceSchema),
		measure_unit_id: IdSchema,
		measure_unit: v.nullable(IDReferenceSchema),
		quant_required: NumberSchema,
		quant: NumberSchema,
	});
	const OrderDetailDTOSchema = v.object({
		id: IdSchema,
		version: IdSchema,
		for_date: DateStringSchema,
		number_1c: v.nullable(TextSchema),
		ref_1c: v.nullable(Ref1CSchema),
		customer_id: IdSchema,
		customer: v.nullable(IDReferenceSchema),
		customer_sale_place_id: IdSchema,
		customer_sale_place: v.nullable(IDReferenceSchema),
		customer_user_id: v.nullable(IdSchema),
		customer_user: v.nullable(IDReferenceSchema),
		status_id: v.nullable(IdSchema),
		status: v.nullable(IDReferenceSchema),
		comment_customer: v.nullable(TextSchema),
		comment_admin: v.nullable(TextSchema),
		items: v.array(OrderDetailItemDTOSchema),
	});
	const OrderDocumentSchema = v.object({
		id: NonNegativeIntSchema,
		version: NonNegativeIntSchema,
		for_date: v.date(),
		number_1c: v.nullable(TextSchema),
		ref_1c: v.nullable(Ref1CSchema),
		customer_id: IdSchema,
		customer_sale_place_id: IdSchema,
		customer_user_id: v.nullable(IdSchema),
		status_id: v.nullable(IdSchema),
		comment_customer: v.nullable(TextSchema),
		comment_admin: v.nullable(TextSchema),
		items: v.pipe(
			v.array(OrderDocumentItemSchema),
			v.minLength(1, t("Order.items.errors.required")),
		),
	});

	return {
		OrderDetailDTOSchema,
		OrderDocumentSchema,
	};
};

const schemas = createOrderDocumentSchemas(defaultTranslate);

export const OrderDetailDTOSchema = schemas.OrderDetailDTOSchema;
export const OrderDocumentSchema = schemas.OrderDocumentSchema;

export const orderDetailFromDTO = (dto: unknown): OrderDetail => {
	const parsed = v.parse(OrderDetailDTOSchema, dto);

	return {
		...parsed,
		for_date: new Date(parsed.for_date),
	};
};

export const parseOrderDocument = (value: unknown): OrderDocument => {
	return parseWithSchema(OrderDocumentSchema, value);
};
