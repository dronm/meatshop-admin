<script setup lang="ts">
import { computed } from "vue";

import { ReferenceKeyInput } from "@katren/vue-collection-lib";

import { createCustomerSalePlaceReference } from "@/references/customerReferences";

const props = withDefaults(defineProps<{
	modelValue?: number | null;
	modelDescr?: string | null;
	customerId?: number | null;
	id?: string;
	label?: string;
	placeholder?: string;
	invalid?: boolean;
	error?: string | null;
	disabled?: boolean;
	required?: boolean;
	showClear?: boolean;
}>(), {
	modelValue: null,
	modelDescr: null,
	customerId: null,
	id: "customerSalePlaceReference",
	label: "",
	placeholder: "",
	invalid: false,
	error: null,
	disabled: false,
	required: false,
	showClear: true,
});

const emit = defineEmits<{
	"update:modelValue": [value: number | null];
}>();

const reference = computed(() => {
	const customerId = typeof props.customerId === "number" && props.customerId > 0
		? props.customerId
		: null;
	const baseReference = createCustomerSalePlaceReference(customerId);

	return {
		...baseReference,
		load: async (value: number | null | undefined) => {
			const descr = props.modelDescr?.trim() ?? "";
			if (
			value === props.modelValue
			&& typeof value === "number"
			&& value > 0
			&& descr !== ""
		) {
				return {
					keys: { id: value },
					descr,
				};
			}

			return await baseReference.load(value);
		},
	};
});
</script>

<template>
	<ReferenceKeyInput
		:id="props.id"
		:modelValue="props.modelValue"
		:reference="reference"
		:label="props.label"
		:placeholder="props.placeholder"
		:invalid="props.invalid"
		:error="props.error"
		:disabled="props.disabled || !props.customerId"
		:required="props.required"
		:showOpen="false"
		:showSelect="false"
		:showClear="props.showClear"
		@update:modelValue="emit('update:modelValue', $event)"
	/>
</template>
