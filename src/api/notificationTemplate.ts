import { createCrudApi } from "@/api/createCrudApi";
import { notificationTemplateFromDTO } from "@/schemas/notificationTemplate";
import type {
	NotificationTemplate,
	NotificationTemplateDTO,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd,
} from "@/types/notificationTemplate";

const notificationTemplateCrudApi = createCrudApi<
	NotificationTemplate,
	NotificationTemplateDTO,
	NotificationTemplate,
	NotificationTemplateDTO,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd
>({
	basePath: "/notification-templates",
	serviceName: "NotificationTemplate",
	getKeyValue: (key) => key.id,
	fromListDTO: notificationTemplateFromDTO,
	fromDetailDTO: notificationTemplateFromDTO,
});

export const notificationTemplateApi = {
	...notificationTemplateCrudApi,
};
