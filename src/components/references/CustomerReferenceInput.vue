<script setup lang="ts">
import { computed } from "vue";

import { ReferenceKeyInput } from "@katren/vue-collection-lib";

import { customerReference } from "@/references/customerReferences";

const props = withDefaults(defineProps<{
	modelValue?: number | null;
	modelDescr?: string | null;
	id?: string;
	label?: string;
	placeholder?: string;
	invalid?: boolean;
	error?: string | null;
	disabled?: boolean;
	required?: boolean;
	showOpen?: boolean;
	showSelect?: boolean;
	showClear?: boolean;
}>(), {
	modelValue: null,
	modelDescr: null,
	id: "customerReference",
	label: "",
	placeholder: "",
	invalid: false,
	error: null,
	disabled: false,
	required: false,
	showOpen: true,
	showSelect: true,
	showClear: true,
});

const emit = defineEmits<{
	"update:modelValue": [value: number | null];
}>();

const reference = computed(() => ({
	...customerReference,
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

		return await customerReference.load(value);
	},
}));
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
		:disabled="props.disabled"
		:required="props.required"
		:showOpen="props.showOpen"
		:showSelect="props.showSelect"
		:showClear="props.showClear"
		@update:modelValue="emit('update:modelValue', $event)"
	/>
</template>
