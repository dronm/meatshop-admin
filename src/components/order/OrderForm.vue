<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

import {
	CollectionForm,
	FormField,
	useCollectionFormModel,
	type CollectionFormMode,
	type FormErrorsView,
} from "@katren/vue-collection-lib";

import OrderItemsGrid from "@/components/order/OrderItemsGrid.vue";
import CustomerReferenceInput from "@/components/references/CustomerReferenceInput.vue";
import CustomerSalePlaceReferenceInput from "@/components/references/CustomerSalePlaceReferenceInput.vue";
import CustomerUserReferenceInput from "@/components/references/CustomerUserReferenceInput.vue";
import OrderStatusReferenceInput from "@/components/references/OrderStatusReferenceInput.vue";
import { createOrderDocumentFormModel } from "@/forms/orderDocument";
import type { OrderFormModel } from "@/types/orderDocument";

const props = withDefaults(
	defineProps<{
		model?: Partial<OrderFormModel>;
		mode?: CollectionFormMode;
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
	submit: [model: OrderFormModel];
	cancel: [];
}>();

const { t } = useI18n();
const itemsGridRef = ref<InstanceType<typeof OrderItemsGrid> | null>(null);
const itemErrors = computed(() => {
	return Object.entries(props.errors?.fieldErrors ?? {})
		.filter(
			([field]) =>
				field === "items" || field.startsWith("items."),
		)
		.flatMap(([, messages]) => messages);
});

const { form } = useCollectionFormModel<OrderFormModel>({
	model: () => props.model,
	defaults: createOrderDocumentFormModel,
	fromModel: (model, defaults) => ({
		...defaults,
		...model,
		for_date: model.for_date ?? defaults.for_date,
		items: (model.items ?? defaults.items).map((item) => ({
			...item,
		})),
	}),
});

const updateCustomerID = (value: number | null): void => {
	if (form.value.customer_id === value) {
		return;
	}

	form.value.customer_id = value;
	form.value.customer = null;
	form.value.customer_user_id = null;
	form.value.customer_user = null;
	form.value.customer_sale_place_id = null;
	form.value.customer_sale_place = null;
};

const updateCustomerUserID = (value: number | null): void => {
	form.value.customer_user_id = value;
	form.value.customer_user = null;
};

const updateCustomerSalePlaceID = (value: number | null): void => {
	form.value.customer_sale_place_id = value;
	form.value.customer_sale_place = null;
};

const submit = async (): Promise<void> => {
	await itemsGridRef.value?.commitPendingEdit();
	await nextTick();

	emit("submit", {
		...form.value,
		items: form.value.items.map((item) => ({
			...item,
		})),
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
		<div
			class="form-two-column-grid grid grid-cols-1 gap-4 md:grid-cols-2"
		>
			<div class="space-y-4">
				<FormField
					field="for_date"
					forId="orderForDate"
					:label="t('Order.fields.for_date')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<DatePicker
						id="orderForDate"
						v-model="form.for_date"
						:invalid="invalid"
					/>
				</FormField>

				<FormField
					field="number_1c"
					forId="orderNumber1C"
					:label="t('Order.fields.number_1c')"
					:errors="props.errors"
					v-slot="{ invalid }"
				>
					<InputText
						id="orderNumber1C"
						v-model="form.number_1c"
						:invalid="invalid"
					/>
				</FormField>

				<FormField
					field="status_id"
					forId="orderStatusID"
					:label="t('Order.fields.status_id')"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<OrderStatusReferenceInput
						id="orderStatusID"
						v-model="form.status_id"
						:invalid="invalid"
						:error="error"
					/>
				</FormField>
			</div>

			<div class="space-y-4">
				<FormField
					field="customer_id"
					forId="orderCustomerID"
					:label="t('Order.fields.customer_id')"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<CustomerReferenceInput
						id="orderCustomerID"
						:modelValue="form.customer_id"
						:modelDescr="
							form.customer?.descr
						"
						:invalid="invalid"
						:error="error"
						required
						@update:modelValue="
							updateCustomerID
						"
					/>
				</FormField>

				<FormField
					field="customer_sale_place_id"
					forId="orderCustomerSalePlaceID"
					:label="
						t(
							'Order.fields.customer_sale_place_id',
						)
					"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<CustomerSalePlaceReferenceInput
						id="orderCustomerSalePlaceID"
						:modelValue="
							form.customer_sale_place_id
						"
						:modelDescr="
							form.customer_sale_place
								?.descr
						"
						:customerId="form.customer_id"
						:invalid="invalid"
						:error="error"
						required
						@update:modelValue="
							updateCustomerSalePlaceID
						"
					/>
				</FormField>

				<FormField
					field="customer_user_id"
					forId="orderCustomerUserID"
					:label="
						t(
							'Order.fields.customer_user_id',
						)
					"
					:errors="props.errors"
					v-slot="{ invalid, error }"
				>
					<CustomerUserReferenceInput
						id="orderCustomerUserID"
						:modelValue="
							form.customer_user_id
						"
						:modelDescr="
							form.customer_user
								?.descr
						"
						:customerId="form.customer_id"
						:invalid="invalid"
						:error="error"
						@update:modelValue="
							updateCustomerUserID
						"
					/>
				</FormField>
			</div>
		</div>

		<div class="mt-6 space-y-2">
			<div
				v-if="itemErrors.length > 0"
				class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
			>
				<div
					v-for="message in itemErrors"
					:key="message"
				>
					{{ message }}
				</div>
			</div>

			<OrderItemsGrid
				ref="itemsGridRef"
				v-model="form.items"
			/>
		</div>

		<div class="mt-6 space-y-4">
			<FormField
				field="comment_customer"
				forId="orderCommentCustomer"
				:label="t('Order.fields.comment_customer')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<Textarea
					id="orderCommentCustomer"
					v-model="form.comment_customer"
					:invalid="invalid"
					rows="3"
					autoResize
					class="w-full"
				/>
			</FormField>

			<FormField
				field="comment_admin"
				forId="orderCommentAdmin"
				:label="t('Order.fields.comment_admin')"
				:errors="props.errors"
				containerClass=""
				v-slot="{ invalid }"
			>
				<Textarea
					id="orderCommentAdmin"
					v-model="form.comment_admin"
					:invalid="invalid"
					rows="3"
					autoResize
					class="w-full"
				/>
			</FormField>
		</div>
	</CollectionForm>
</template>
