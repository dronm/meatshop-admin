<script setup lang="ts">
import { ReferenceKeyInput } from "@katren/vue-collection-lib";

import { measureUnitReference } from "@/references/productReferences";

const props = withDefaults(defineProps<{
	modelValue?: number | null;
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
	id: "measureUnitReference",
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
</script>

<template>
	<ReferenceKeyInput
		:id="props.id"
		:modelValue="props.modelValue"
		:reference="measureUnitReference"
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
