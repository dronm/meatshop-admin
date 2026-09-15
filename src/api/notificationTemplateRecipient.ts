import { createCrudApi } from "@/api/createCrudApi";
import { notificationTemplateRecipientFromDTO } from "@/schemas/notificationTemplateRecipient";
import type {
	NotificationTemplateRecipient,
	NotificationTemplateRecipientDTO,
	NotificationTemplateRecipientKey,
	NotificationTemplateRecipientNew,
	NotificationTemplateRecipientUpd,
} from "@/types/notificationTemplateRecipient";

const notificationTemplateRecipientCrudApi = createCrudApi<
	NotificationTemplateRecipient,
	NotificationTemplateRecipientDTO,
	NotificationTemplateRecipient,
	NotificationTemplateRecipientDTO,
	NotificationTemplateRecipientKey,
	NotificationTemplateRecipientNew,
	NotificationTemplateRecipientUpd
>({
	basePath: "/notification-template-recipients",
	serviceName: "NotificationTemplateRecipient",
	getKeyValue: (key) => key.id,
	fromListDTO: notificationTemplateRecipientFromDTO,
	fromDetailDTO: notificationTemplateRecipientFromDTO,
});

export const notificationTemplateRecipientApi = {
	...notificationTemplateRecipientCrudApi,
};
