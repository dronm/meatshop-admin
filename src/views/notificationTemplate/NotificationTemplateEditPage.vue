<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import {
	CollectionEditPage,
	useCollectionEditPage,
} from "@katren/vue-collection-lib";

import { notificationTemplateApi } from "@/api/notificationTemplate";
import NotificationTemplateForm from "@/components/notificationTemplate/NotificationTemplateForm.vue";
import NotificationTemplateRecipientsGrid from "@/components/notificationTemplate/NotificationTemplateRecipientsGrid.vue";
import {
	createNotificationTemplateFormModel,
	notificationTemplateFormMutationFields,
	type NotificationTemplateFormModel,
} from "@/forms/notificationTemplate";
import {
	NotificationTemplateNewSchema,
	NotificationTemplateUpdSchema,
} from "@/schemas/notificationTemplate";
import type {
	NotificationTemplate,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd,
} from "@/types/notificationTemplate";

const { t } = useI18n();
const edit = useCollectionEditPage<
	NotificationTemplateFormModel,
	NotificationTemplateKey,
	NotificationTemplateNew,
	NotificationTemplateUpd,
	NotificationTemplate
>({
	api: notificationTemplateApi,
	createRouteName: "notificationTemplateCreate",
	listRoute: { name: "notificationTemplates" },
	keyFromRoute: (route) => ({
		id: Number(route.params.id ?? 0),
	}),
	createModel: createNotificationTemplateFormModel,
	fields: notificationTemplateFormMutationFields,
	createSchema: NotificationTemplateNewSchema,
	updateSchema: NotificationTemplateUpdSchema,
	success: {
		mode: "stay",
		editRoute: (key) => ({
			name: "notificationTemplateEdit",
			params: { id: String(key.id) },
		}),
	},
});

const templateId = computed(() => {
	const id = edit.model.value.id;
	return typeof id === "number" && id > 0 ? id : null;
});

const submit = async (model: NotificationTemplateNew): Promise<void> => {
	await edit.submit(model);
};
</script>

<template>
	<CollectionEditPage
		:title="t(`NotificationTemplate.form.${edit.mode.value}`)"
		:loading="edit.loading.value"
		@back="edit.goBack"
	>
		<div class="space-y-6">
			<NotificationTemplateForm
				:model="edit.model.value"
				:mode="edit.mode.value"
				:errors="edit.errors"
				:submitting="edit.submitting.value"
				@submit="submit"
				@cancel="edit.goBack"
			/>

			<div
				v-if="templateId === null"
				class="rounded-lg border border-dashed border-surface-300 p-4 text-sm text-surface-500"
			>
				{{ t("NotificationTemplate.recipients.saveFirst") }}
			</div>
			<NotificationTemplateRecipientsGrid
				v-else
				:templateId="templateId"
			/>
		</div>
	</CollectionEditPage>
</template>
