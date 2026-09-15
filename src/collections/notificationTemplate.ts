import {
	defineCollection,
	type GridCommand,
} from "@katren/vue-collection-lib";

import { notificationTemplateApi } from "@/api/notificationTemplate";
import type {
	NotificationTemplate,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd,
} from "@/types/notificationTemplate";

const commands: GridCommand<NotificationTemplate, NotificationTemplateKey>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "delete" },
	{ name: "search" },
	{ name: "refresh" },
];

export const notificationTemplateCollection = defineCollection<
	NotificationTemplate,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd,
	NotificationTemplate
>({
	titleKey: "NotificationTemplate.title",
	api: notificationTemplateApi,
	columns: [
		{
			field: "id",
			headerKey: "NotificationTemplate.fields.id",
			sortable: true,
			dataType: "number",
			align: "right",
			width: "7rem",
		},
		{
			field: "code",
			headerKey: "NotificationTemplate.fields.code",
			sortable: true,
			width: "20rem",
		},
		{
			field: "event",
			headerKey: "NotificationTemplate.fields.event",
			sortable: true,
			width: "22rem",
		},
		{
			field: "is_active",
			headerKey: "NotificationTemplate.fields.is_active",
			sortable: true,
			dataType: "boolean",
			align: "center",
			width: "9rem",
		},
	],
	commands,
	dataKey: "id",
	getKey: (row) => ({ id: row.id }),
	routes: {
		create: () => ({ name: "notificationTemplateCreate" }),
		edit: (row) => ({
			name: "notificationTemplateEdit",
			params: { id: String(row.id) },
		}),
	},
	editMode: "page",
	stateKey: "notification-template-grid",
	pageSize: 30,
	showCommandShortcuts: false,
});
