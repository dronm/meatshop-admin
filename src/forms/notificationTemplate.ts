import type { FormMutationFieldConfig } from "@katren/vue-collection-lib";

import type {
	NotificationTemplate,
	NotificationTemplateNew,
	NotificationTemplateUpd,
} from "@/types/notificationTemplate";

export type NotificationTemplateFormModel = {
	[Field in keyof NotificationTemplate]?: NotificationTemplate[Field] | null;
};

export const createNotificationTemplateFormModel = (): NotificationTemplateFormModel => ({
	code: "",
	event: "",
	body_template: "",
	is_active: true,
});

export const notificationTemplateFormMutationFields = [
	"code",
	"event",
	"body_template",
	"is_active",
] satisfies FormMutationFieldConfig<
	NotificationTemplateFormModel,
	NotificationTemplateNew | NotificationTemplateUpd
>[];
