import * as v from "valibot";

import {
	createCommonSchemas,
	defaultTranslate,
	type TranslateFn,
} from "@/schemas/common";
import type { NotificationTemplate } from "@/types/notificationTemplate";

export const createNotificationTemplateSchemas = (t: TranslateFn) => {
	const {
		IdSchema,
		RequiredTextSchema,
	} = createCommonSchemas(t);

	const CodeSchema = v.pipe(
		RequiredTextSchema,
		v.maxLength(100, t("validation.maxLen", { maxLen: 100 })),
	);
	const EventSchema = v.pipe(
		RequiredTextSchema,
		v.maxLength(100, t("validation.maxLen", { maxLen: 100 })),
	);
	const BodyTemplateSchema = RequiredTextSchema;

	const NotificationTemplateDTOSchema = v.object({
		id: IdSchema,
		code: CodeSchema,
		event: EventSchema,
		body_template: BodyTemplateSchema,
		is_active: v.boolean(),
	});

	const NotificationTemplateSchema = v.object({
		id: IdSchema,
		code: CodeSchema,
		event: EventSchema,
		body_template: BodyTemplateSchema,
		is_active: v.boolean(),
	});

	const NotificationTemplateKeySchema = v.pick(
		NotificationTemplateSchema,
		["id"],
	);
	const NotificationTemplateNewSchema = v.pick(
		NotificationTemplateSchema,
		["code", "event", "body_template", "is_active"],
	);
	const NotificationTemplateUpdSchema = v.partial(
		v.pick(
			NotificationTemplateSchema,
			["code", "event", "body_template", "is_active"],
		),
	);

	return {
		NotificationTemplateDTOSchema,
		NotificationTemplateSchema,
		NotificationTemplateKeySchema,
		NotificationTemplateNewSchema,
		NotificationTemplateUpdSchema,
	};
};

const schemas = createNotificationTemplateSchemas(defaultTranslate);

export const NotificationTemplateDTOSchema = schemas.NotificationTemplateDTOSchema;
export const NotificationTemplateSchema = schemas.NotificationTemplateSchema;
export const NotificationTemplateKeySchema = schemas.NotificationTemplateKeySchema;
export const NotificationTemplateNewSchema = schemas.NotificationTemplateNewSchema;
export const NotificationTemplateUpdSchema = schemas.NotificationTemplateUpdSchema;

export const notificationTemplateFromDTO = (dto: unknown): NotificationTemplate => {
	return v.parse(NotificationTemplateSchema, dto);
};
