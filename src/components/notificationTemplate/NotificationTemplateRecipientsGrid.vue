<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import {
	CollectionGrid,
	FilterOperatorParam,
	SortDirect,
	type CollectionGridApi,
	type CollectionParams,
	type GridColumn,
	type GridCommand,
} from "@katren/vue-collection-lib";

import { notificationTemplateRecipientApi } from "@/api/notificationTemplateRecipient";
import { userReference } from "@/references/userReferences";
import type {
	NotificationTemplateRecipient,
	NotificationTemplateRecipientKey,
	NotificationTemplateRecipientNew,
	NotificationTemplateRecipientUpd,
} from "@/types/notificationTemplateRecipient";

const props = defineProps<{
	templateId: number;
}>();

const { t } = useI18n();

const normalizedTemplateId = computed(() => {
	return Number.isInteger(props.templateId) && props.templateId > 0
		? props.templateId
		: 0;
});

const withTemplateFilter = (
	params?: CollectionParams,
): CollectionParams => ({
	...params,
	filter: [
		...(params?.filter ?? []),
		{
			f: {
				template_id: {
					o: FilterOperatorParam.E,
					v: normalizedTemplateId.value,
				},
			},
		},
	],
});

const api: CollectionGridApi<
	NotificationTemplateRecipient,
	NotificationTemplateRecipientKey,
	NotificationTemplateRecipientNew,
	NotificationTemplateRecipientUpd,
	NotificationTemplateRecipient
> = {
	serviceName: notificationTemplateRecipientApi.serviceName,
	list: async (params?: CollectionParams) => {
		return await notificationTemplateRecipientApi.list(
			withTemplateFilter(params),
		);
	},
	detail: notificationTemplateRecipientApi.detail,
	create: notificationTemplateRecipientApi.create,
	update: notificationTemplateRecipientApi.update,
	delete: notificationTemplateRecipientApi.delete,
};

const normalizeID = (value: unknown): number => {
	return typeof value === "number" && Number.isInteger(value) && value > 0
		? value
		: 0;
};

const columns: GridColumn<NotificationTemplateRecipient>[] = [
	{
		field: "user_id",
		headerKey: "NotificationTemplateRecipient.fields.user_id",
		editable: true,
		dataType: "reference",
		normalizeValue: normalizeID,
		reference: userReference,
		searchable: false,
		width: "32rem",
		editorProps: {
			required: true,
		},
	},
];

const commands: GridCommand<
	NotificationTemplateRecipient,
	NotificationTemplateRecipientKey
>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "delete" },
	{ name: "refresh" },
];

const createRow = (): NotificationTemplateRecipient => ({
	id: 0,
	template_id: normalizedTemplateId.value,
	template: null,
	user_id: 0,
	user: null,
});

const createModel = (
	row: NotificationTemplateRecipient,
): NotificationTemplateRecipientNew => ({
	template_id: normalizedTemplateId.value,
	user_id: normalizeID(row.user_id),
});

const getKey = (
	row: NotificationTemplateRecipient,
): NotificationTemplateRecipientKey => ({
	id: row.id,
});
</script>

<template>
	<section class="space-y-2">
		<h3 class="text-lg font-semibold">
			{{ t("NotificationTemplate.recipients.title") }}
		</h3>
		<CollectionGrid
			:key="`notification-template-recipients-${normalizedTemplateId}`"
			:api="api"
			:columns="columns"
			:commands="commands"
			:getKey="getKey"
			:createRow="createRow"
			:createModel="createModel"
			:defaultSorter="[
				{
					f: 'user_id',
					d: SortDirect.ASC,
				},
			]"
			dataKey="id"
			editMode="inline"
			commandsMode="replace"
			:pageSize="20"
		/>
	</section>
</template>
