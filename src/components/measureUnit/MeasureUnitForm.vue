<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";

import {
	CollectionForm,
	FormField,
	useCollectionFormModel,
	type FormErrorsView,
} from "@katren/vue-collection-lib";
import {
	createMeasureUnitFormModel,
	type MeasureUnitFormModel,
} from "@/forms/measureUnit.gen";
import type { MeasureUnitNew } from "@/types/measureUnit.gen";

type FormMode = "create" | "edit" | "copy";

const props = withDefaults(defineProps<{
	model?: Partial<MeasureUnitFormModel>;
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
	submit: [model: MeasureUnitNew];
	cancel: [];
}>();

const { t } = useI18n();
const { form } = useCollectionFormModel<MeasureUnitFormModel>({
	model: () => props.model,
	defaults: createMeasureUnitFormModel,
});

const submit = (): void => {
	const model: MeasureUnitNew = {
		name: form.value.name?.trim() ?? "",
		name_full: form.value.name_full?.trim() ?? "",
		is_active: form.value.is_active ?? false,
	};
	emit("submit", model);
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
				field="name"
				forId="measureUnitName"
				:label="t('MeasureUnit.fields.name')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<InputText
					id="measureUnitName"
					v-model="form.name"
					:invalid="invalid"
					:disabled="false"
					autofocus
					required
				/>
			</FormField>
			<FormField
				field="name_full"
				forId="measureUnitNameFull"
				:label="t('MeasureUnit.fields.name_full')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<InputText
					id="measureUnitNameFull"
					v-model="form.name_full"
					:invalid="invalid"
					:disabled="false"
					required
				/>
			</FormField>
			<FormField
				field="is_active"
				forId="measureUnitIsActive"
				:label="t('MeasureUnit.fields.is_active')"
				:errors="props.errors"
				containerClass=" pt-7"
				v-slot="{ invalid }"
			>
				<div class="flex items-center gap-2">
					<Checkbox
						v-model="form.is_active"
						inputId="measureUnitIsActive"
						:invalid="invalid"
						:disabled="false"
						binary
					/>
					<label for="measureUnitIsActive">{{ t("MeasureUnit.fields.is_active") }}</label>
				</div>
			</FormField>
		</div>
	</CollectionForm>
</template>
