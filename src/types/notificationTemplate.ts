export interface NotificationTemplateDTO {
	id: number;
	code: string;
	event: string;
	body_template: string;
	is_active: boolean;
}

export interface NotificationTemplate {
	id: number;
	code: string;
	event: string;
	body_template: string;
	is_active: boolean;
}

export type NotificationTemplateKey = Pick<NotificationTemplate, "id">;
export type NotificationTemplateNew = Pick<
	NotificationTemplate,
	"code" | "event" | "body_template" | "is_active"
>;
export type NotificationTemplateUpd = Partial<NotificationTemplateNew>;

export interface NotificationTemplateUpdate {
	key: NotificationTemplateKey;
	model: NotificationTemplateUpd;
}
