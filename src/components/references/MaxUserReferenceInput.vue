<script setup lang="ts">
import { computed } from "vue";

import { ReferenceKeyInput } from "@katren/vue-collection-lib";

import { maxUserReference } from "@/references/maxUserReferences";

const props = withDefaults(defineProps<{
	modelValue?: number | null;
	modelDescr?: string | null;
	modelDescrId?: number | null;
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
	modelDescrId: null,
	id: "maxUserReference",
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

const reference = computed(() => ({
	...maxUserReference,
	load: async (value: number | null | undefined) => {
		const descr = props.modelDescr?.trim() ?? "";
		if (
			value === props.modelDescrId
			&& typeof value === "number"
			&& value > 0
			&& descr !== ""
		) {
			return {
				keys: { id: value },
				descr,
			};
		}

		return await maxUserReference.load(value);
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
		:showOpen="false"
		:showSelect="false"
		:showClear="props.showClear"
		@update:modelValue="emit('update:modelValue', $event)"
	/>
</template>
