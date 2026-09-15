import * as v from "valibot";

import {
	createCommonSchemas,
	defaultTranslate,
	type TranslateFn,
} from "@/schemas/common";
import type { NotificationTemplateRecipient } from "@/types/notificationTemplateRecipient";

export const createNotificationTemplateRecipientSchemas = (t: TranslateFn) => {
	const { IdSchema } = createCommonSchemas(t);
	const ReferenceSchema = v.object({
		keys: v.object({
			id: IdSchema,
		}),
		descr: v.string(),
	});

	const NotificationTemplateRecipientDTOSchema = v.object({
		id: IdSchema,
		template_id: IdSchema,
		template: v.nullable(ReferenceSchema),
		user_id: IdSchema,
		user: v.nullable(ReferenceSchema),
	});

	const NotificationTemplateRecipientSchema = NotificationTemplateRecipientDTOSchema;
	const NotificationTemplateRecipientKeySchema = v.object({
		id: IdSchema,
	});
	const NotificationTemplateRecipientNewSchema = v.object({
		template_id: IdSchema,
		user_id: IdSchema,
	});
	const NotificationTemplateRecipientUpdSchema = v.partial(
		NotificationTemplateRecipientNewSchema,
	);

	return {
		NotificationTemplateRecipientDTOSchema,
		NotificationTemplateRecipientSchema,
		NotificationTemplateRecipientKeySchema,
		NotificationTemplateRecipientNewSchema,
		NotificationTemplateRecipientUpdSchema,
	};
};

const schemas = createNotificationTemplateRecipientSchemas(defaultTranslate);

export const NotificationTemplateRecipientDTOSchema =
	schemas.NotificationTemplateRecipientDTOSchema;
export const NotificationTemplateRecipientSchema =
	schemas.NotificationTemplateRecipientSchema;
export const NotificationTemplateRecipientKeySchema =
	schemas.NotificationTemplateRecipientKeySchema;
export const NotificationTemplateRecipientNewSchema =
	schemas.NotificationTemplateRecipientNewSchema;
export const NotificationTemplateRecipientUpdSchema =
	schemas.NotificationTemplateRecipientUpdSchema;

export const notificationTemplateRecipientFromDTO = (
	dto: unknown,
): NotificationTemplateRecipient => {
	return v.parse(NotificationTemplateRecipientSchema, dto);
};
