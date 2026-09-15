<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

import {
	CollectionForm,
	FormField,
	useCollectionFormModel,
	type FormErrorsView,
} from "@katren/vue-collection-lib";
import {
	createNotificationTemplateFormModel,
	type NotificationTemplateFormModel,
} from "@/forms/notificationTemplate";
import type { NotificationTemplateNew } from "@/types/notificationTemplate";

type FormMode = "create" | "edit" | "copy";

const props = withDefaults(defineProps<{
	model?: Partial<NotificationTemplateFormModel>;
	mode?: FormMode;
	errors?: FormErrorsView;
	submitting?: boolean;
}>(), {
	model: () => ({}),
	mode: "create",
	errors: undefined,
	submitting: false,
});

const emit = defineEmits<{
	submit: [model: NotificationTemplateNew];
	cancel: [];
}>();

const { t } = useI18n();
const { form } = useCollectionFormModel<NotificationTemplateFormModel>({
	model: () => props.model,
	defaults: createNotificationTemplateFormModel,
});

const submit = (): void => {
	emit("submit", {
		code: form.value.code?.trim() ?? "",
		event: form.value.event?.trim() ?? "",
		body_template: form.value.body_template?.trim() ?? "",
		is_active: form.value.is_active ?? false,
	});
};
</script>

<template>
	<CollectionForm
		:errors="props.errors"
		:submitting="props.submitting"
		@submit="submit"
		@cancel="emit('cancel')"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<FormField
				field="code"
				forId="notificationTemplateCode"
				:label="t('NotificationTemplate.fields.code')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<InputText
					id="notificationTemplateCode"
					v-model="form.code"
					:invalid="invalid"
					autofocus
					required
				/>
			</FormField>

			<FormField
				field="event"
				forId="notificationTemplateEvent"
				:label="t('NotificationTemplate.fields.event')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<InputText
					id="notificationTemplateEvent"
					v-model="form.event"
					:invalid="invalid"
					required
				/>
			</FormField>

			<FormField
				field="body_template"
				forId="notificationTemplateBody"
				:label="t('NotificationTemplate.fields.body_template')"
				:errors="props.errors"
				containerClass="md:col-span-2"
				v-slot="{ invalid }"
			>
				<Textarea
					id="notificationTemplateBody"
					v-model="form.body_template"
					:invalid="invalid"
					rows="10"
					autoResize
					class="w-full font-mono"
					required
				/>
			</FormField>

			<FormField
				field="is_active"
				forId="notificationTemplateIsActive"
				:label="t('NotificationTemplate.fields.is_active')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<Checkbox
					v-model="form.is_active"
					inputId="notificationTemplateIsActive"
					:invalid="invalid"
					binary
				/>
			</FormField>
		</div>
	</CollectionForm>
</template>
