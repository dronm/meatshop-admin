<script setup lang="ts">
import { useI18n } from "vue-i18n";

import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

import {
	CollectionForm,
	FormField,
	useCollectionFormModel,
	type FormErrorsView,
} from "@katren/vue-collection-lib";

import MeasureUnitReferenceInput from "@/components/references/MeasureUnitReferenceInput.vue";
import ProductGroupReferenceInput from "@/components/references/ProductGroupReferenceInput.vue";
import ProductRef1cReferenceInput from "@/components/references/ProductRef1cReferenceInput.vue";
import {
	createProductFormModel,
	type ProductFormModel,
} from "@/forms/product.gen";
import type { ProductNew } from "@/types/product.gen";
import { normalizeRef1C } from "@/utils/ref1c";

type FormMode = "create" | "edit" | "copy";

const props = withDefaults(
	defineProps<{
		model?: Partial<ProductFormModel>;
		mode?: FormMode;
		errors?: FormErrorsView;
		submitting?: boolean;
	}>(),
	{
		model: () => ({}),
		mode: "create",
		errors: undefined,
		submitting: false,
	},
);

const emit = defineEmits<{
	submit: [model: ProductNew];
	cancel: [];
}>();

const { t } = useI18n();
const { form } = useCollectionFormModel<ProductFormModel>({
	model: () => props.model,
	defaults: createProductFormModel,
});

const normalizedID = (value: number | null | undefined): number | null => {
	return typeof value === "number" && Number.isInteger(value) && value > 0
		? value
		: null;
};

const normalizedText = (value: unknown): string | null => {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
};

const normalizedName = (value: unknown): string => {
	return typeof value === "string" ? value.trim() : "";
};

const submit = (): void => {
	const parentID = normalizedID(form.value.parent_id);
	const measureUnitID = normalizedID(form.value.measure_unit_id);
	const description = normalizedText(form.value.description);
	const ref1C = normalizeRef1C(form.value.ref_1c);
	const sortOrder =
		typeof form.value.sort_order === "number"
			? form.value.sort_order
			: null;

	const model: ProductNew = {
		parent_id: parentID,
		name: normalizedName(form.value.name),
		description,
		ref_1c: ref1C,
		sort_order: sortOrder ?? 0,
		measure_unit_id: measureUnitID,
		is_group: form.value.is_group === true,
		is_active: form.value.is_active === true,
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
		<div
			class="form-two-column-grid grid grid-cols-1 gap-4 md:grid-cols-2"
		>
			<div class="space-y-4">
				<FormField
					field="is_group"
					forId="productIsGroup"
					:label="t('Product.fields.is_group')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<Checkbox
						v-model="form.is_group"
						inputId="productIsGroup"
						:invalid="invalid"
						binary
					/>
				</FormField>

				<FormField
					field="name"
					forId="productName"
					:label="t('Product.fields.name')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputText
						id="productName"
						v-model="form.name"
						:invalid="invalid"
						autofocus
						required
					/>
				</FormField>

				<FormField
					v-if="!form.is_group"
					field="measure_unit_id"
					forId="productMeasureUnitID"
					:label="
						t(
							'Product.fields.measure_unit_id',
						)
					"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<MeasureUnitReferenceInput
						id="productMeasureUnitID"
						v-model="form.measure_unit_id"
						:invalid="invalid"
					/>
				</FormField>
			</div>

			<div v-if="!form.is_group" class="space-y-4">
				<FormField
					field="parent_id"
					forId="productParentID"
					:label="t('Product.fields.parent_id')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<ProductGroupReferenceInput
						id="productParentID"
						v-model="form.parent_id"
						:invalid="invalid"
					/>
				</FormField>

				<FormField
					field="ref_1c"
					forId="productRef1C"
					:label="t('Product.fields.ref_1c')"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<ProductRef1cReferenceInput
						id="productRef1C"
						v-model="form.ref_1c"
						:invalid="invalid"
						:error="error"
					/>
				</FormField>

				<FormField
					field="sort_order"
					forId="productSortOrder"
					:label="t('Product.fields.sort_order')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputNumber
						id="productSortOrder"
						v-model="form.sort_order"
						:invalid="invalid"
						:useGrouping="false"
					/>
				</FormField>
			</div>

			<FormField
				v-if="!form.is_group"
				field="description"
				forId="productDescription"
				:label="t('Product.fields.description')"
				:errors="props.errors"
				containerClass="md:col-span-2"
				v-slot="{ invalid }"
			>
				<Textarea
					id="productDescription"
					v-model="form.description"
					:invalid="invalid"
					rows="3"
					autoResize
					class="w-full"
				/>
			</FormField>

			<FormField
				field="is_active"
				forId="productIsActive"
				:label="t('Product.fields.is_active')"
				:errors="props.errors"
				containerClass="md:col-span-2"
				v-slot="{ invalid }"
			>
				<Checkbox
					v-model="form.is_active"
					inputId="productIsActive"
					:invalid="invalid"
					binary
				/>
			</FormField>
		</div>
	</CollectionForm>
</template>
