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
import CounterpartyRef1cReferenceInput from "@/components/references/CounterpartyRef1cReferenceInput.vue";
import {
	createCustomerFormModel,
	type CustomerFormModel,
} from "@/forms/customer.gen";
import type { CustomerNew } from "@/types/customer.gen";
import { normalizeRef1C } from "@/utils/ref1c";

type FormMode = "create" | "edit" | "copy";

const props = withDefaults(
	defineProps<{
		model?: Partial<CustomerFormModel>;
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
	submit: [model: CustomerNew];
	cancel: [];
}>();

const { t } = useI18n();
const { form } = useCollectionFormModel<CustomerFormModel>({
	model: () => props.model,
	defaults: createCustomerFormModel,
});

const submit = (): void => {
	const model: CustomerNew = {
		name: form.value.name?.trim() ?? "",
		inn: form.value.inn?.trim() ?? "",
		kpp: form.value.kpp?.trim() ?? "",
		ref_1c: normalizeRef1C(form.value.ref_1c),
		is_active: form.value.is_active ?? false,
		allow_holiday_orders: form.value.allow_holiday_orders === true,
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
					field="name"
					forId="customerName"
					:label="t('Customer.fields.name')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputText
						id="customerName"
						v-model="form.name"
						:invalid="invalid"
						autofocus
						required
					/>
				</FormField>

				<FormField
					field="ref_1c"
					forId="customerRef1C"
					:label="t('Customer.fields.ref_1c')"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<CounterpartyRef1cReferenceInput
						id="customerRef1C"
						v-model="form.ref_1c"
						:invalid="invalid"
						:error="error"
					/>
				</FormField>

				<FormField
					field="allow_holiday_orders"
					forId="customerAllowHolidayOrders"
					:label="
						t(
							'Customer.fields.allow_holiday_orders',
						)
					"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<Checkbox
						v-model="
							form.allow_holiday_orders
						"
						inputId="customerAllowHolidayOrders"
						:invalid="invalid"
						binary
					/>
				</FormField>
			</div>

			<div class="space-y-4">
				<FormField
					field="inn"
					forId="customerInn"
					:label="t('Customer.fields.inn')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputText
						id="customerInn"
						v-model="form.inn"
						:invalid="invalid"
					/>
				</FormField>

				<FormField
					field="kpp"
					forId="customerKpp"
					:label="t('Customer.fields.kpp')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputText
						id="customerKpp"
						v-model="form.kpp"
						:invalid="invalid"
					/>
				</FormField>
			</div>
		</div>
	</CollectionForm>
</template>
