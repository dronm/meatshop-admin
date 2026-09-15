import * as v from "valibot";

import { i18n } from "@/i18n";

export type TranslateFn = (
	key: string,
	params?: Record<string, unknown>,
) => string;

export const defaultTranslate: TranslateFn = (
	key: string,
	params: Record<string, unknown> = {},
): string => {
	return String(i18n.global.t(key, params as Record<string, string | number | boolean>));
};

export const createCommonSchemas = (t: TranslateFn) => {
	const RequiredStringSchema = v.pipe(
		v.string(t("validation.required")),
		v.trim(),
		v.nonEmpty(t("validation.required")),
		v.maxLength(1024, t("validation.maxLen", { maxLen: 1024 })),
	);

	const StringSchema = v.pipe(
		v.string(t("validation.required")),
		v.trim(),
		v.maxLength(1024, t("validation.maxLen", { maxLen: 1024 })),
	);

	const RequiredTextSchema = v.pipe(
		v.string(t("validation.required")),
		v.trim(),
		v.nonEmpty(t("validation.required")),
	);

	const TextSchema = v.pipe(
		v.string(t("validation.required")),
		v.trim(),
	);

	const DateStringSchema = v.pipe(
		v.string(t("validation.required")),
		v.nonEmpty(t("validation.required")),
	);

	const IntSchema = v.pipe(
		v.number(t("validation.required")),
		v.integer(t("validation.dataTypeInt")),
	);

	const IdSchema = v.pipe(
		IntSchema,
		v.minValue(1, t("validation.minVal", { minVal: 1 })),
	);

	const NumberSchema = v.number(t("validation.required"));

	const AttrsSchema = v.record(
		v.string(),
		v.unknown(),
	);

	const YearSchema = v.pipe(
		IntSchema,
		v.minValue(1900, t("validation.minVal", { minVal: 1900 })),
		v.maxValue(2100, t("validation.maxVal", { maxVal: 2100 })),
	);

	return {
		RequiredStringSchema,
		StringSchema,
		RequiredTextSchema,
		TextSchema,
		DateStringSchema,
		IntSchema,
		IdSchema,
		NumberSchema,
		AttrsSchema,
		YearSchema,
	};
};

export type CommonSchemas = ReturnType<typeof createCommonSchemas>;

const commonSchemas = createCommonSchemas(defaultTranslate);

export const RequiredStringSchema = commonSchemas.RequiredStringSchema;
export const StringSchema = commonSchemas.StringSchema;
export const RequiredTextSchema = commonSchemas.RequiredTextSchema;
export const TextSchema = commonSchemas.TextSchema;
export const DateStringSchema = commonSchemas.DateStringSchema;
export const IntSchema = commonSchemas.IntSchema;
export const IdSchema = commonSchemas.IdSchema;
export const NumberSchema = commonSchemas.NumberSchema;
export const AttrsSchema = commonSchemas.AttrsSchema;
export const YearSchema = commonSchemas.YearSchema;
