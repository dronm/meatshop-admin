<script setup lang="ts">
import Select from "primevue/select";

type OrderStatusOption = {
	value: number;
	label: string;
};

const props = withDefaults(defineProps<{
	modelValue?: number | null;
	id?: string;
	label?: string;
	invalid?: boolean;
	error?: string | null;
	disabled?: boolean;
	showClear?: boolean;
}>(), {
	modelValue: null,
	id: "orderStatusReference",
	label: "",
	invalid: false,
	error: null,
	disabled: false,
	showClear: true,
});

const emit = defineEmits<{
	"update:modelValue": [value: number | null];
}>();

const options: OrderStatusOption[] = [
	{ value: 1, label: "Новый" },
	{ value: 2, label: "Принят" },
	{ value: 3, label: "В обработке" },
	{ value: 4, label: "Согласован" },
	{ value: 5, label: "Выполнен" },
	{ value: 6, label: "Отменен" },
];
</script>

<template>
	<div class="w-full">
		<label
			v-if="props.label"
			:for="props.id"
			class="mb-1 block"
		>
			{{ props.label }}
		</label>

		<Select
			:id="props.id"
			:modelValue="props.modelValue"
			:options="options"
			optionLabel="label"
			optionValue="value"
			:invalid="props.invalid"
			:disabled="props.disabled"
			:showClear="props.showClear"
			class="w-full"
			@update:modelValue="emit('update:modelValue', $event)"
		/>

		<small
			v-if="props.error"
			class="mt-1 block text-red-600"
		>
			{{ props.error }}
		</small>
	</div>
</template>
