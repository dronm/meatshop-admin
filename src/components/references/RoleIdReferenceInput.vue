<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import Select from "primevue/select";

import {
	ROLE_ID_VALUES,
	type RoleId,
	type RoleIdOption,
} from "@/types/enums/roleId";

const props = withDefaults(defineProps<{
	modelValue?: RoleId | null;
	id?: string;
	invalid?: boolean;
	disabled?: boolean;
	showClear?: boolean;
}>(), {
	modelValue: null,
	id: "roleIdReference",
	invalid: false,
	disabled: false,
	showClear: true,
});

const emit = defineEmits<{
	"update:modelValue": [value: RoleId | null];
}>();

const { t } = useI18n();

const options = computed<RoleIdOption[]>(() => {
	return ROLE_ID_VALUES.map((value) => ({
		value,
		label: t(`RoleId.${value}`),
	}));
});

const selectedValue = computed({
	get: (): RoleId | null => props.modelValue,
	set: (value: RoleId | null): void => {
		emit("update:modelValue", value);
	},
});
</script>

<template>
	<Select
		:id="props.id"
		v-model="selectedValue"
		:options="options"
		optionLabel="label"
		optionValue="value"
		:invalid="props.invalid"
		:disabled="props.disabled"
		:showClear="props.showClear"
		class="w-full"
	/>
</template>
