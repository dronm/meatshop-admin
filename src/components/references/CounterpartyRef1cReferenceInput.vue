<script setup lang="ts">
import Integration1cReferenceInput from "@/components/references/Integration1cReferenceInput.vue";
import type { Ref1C } from "@/types/ref1c";

const props = withDefaults(
	defineProps<{
		modelValue?: Record<string, unknown> | null;
		id?: string;
		label?: string;
		placeholder?: string;
		invalid?: boolean;
		error?: string | null;
		disabled?: boolean;
		required?: boolean;
		showClear?: boolean;
	}>(),
	{
		modelValue: null,
		id: "counterpartyRef1cReference",
		label: "",
		placeholder: "",
		invalid: false,
		error: null,
		disabled: false,
		required: false,
		showClear: true,
	},
);

const emit = defineEmits<{
	"update:modelValue": [value: Ref1C | null];
}>();
</script>

<template>
	<Integration1cReferenceInput
		:id="props.id"
		:modelValue="props.modelValue"
		catalogueType="counterparties"
		:label="props.label"
		:placeholder="props.placeholder"
		:invalid="props.invalid"
		:error="props.error"
		:disabled="props.disabled"
		:required="props.required"
		:showClear="props.showClear"
		@update:modelValue="emit('update:modelValue', $event)"
	/>
</template>
