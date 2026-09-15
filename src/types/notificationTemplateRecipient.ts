export interface NotificationReference {
	keys: {
		id: number;
	};
	descr: string;
}

export interface NotificationTemplateRecipientDTO {
	id: number;
	template_id: number;
	template: NotificationReference | null;
	user_id: number;
	user: NotificationReference | null;
}

export interface NotificationTemplateRecipient {
	id: number;
	template_id: number;
	template: NotificationReference | null;
	user_id: number;
	user: NotificationReference | null;
}

export type NotificationTemplateRecipientKey = Pick<
	NotificationTemplateRecipient,
	"id"
>;

export interface NotificationTemplateRecipientNew {
	template_id: number;
	user_id: number;
}

export type NotificationTemplateRecipientUpd = Partial<
	NotificationTemplateRecipientNew
>;
