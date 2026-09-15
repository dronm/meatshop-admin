<script setup lang="ts">
import { ref, watch } from "vue";

import AutoComplete from "primevue/autocomplete";

import { integration1cApi } from "@/api/integration1c";
import type { Ref1C } from "@/types/ref1c";
import { normalizeRef1C } from "@/utils/ref1c";

type CatalogueType = "nomenclature" | "counterparties";

type Integration1cSuggestion = Ref1C & {
	inn?: string;
};

type CompleteEvent = {
	query: string;
};

const props = withDefaults(defineProps<{
	modelValue?: Record<string, unknown> | null;
	catalogueType: CatalogueType;
	id?: string;
	label?: string;
	placeholder?: string;
	invalid?: boolean;
	error?: string | null;
	disabled?: boolean;
	required?: boolean;
	showClear?: boolean;
	minLength?: number;
	delay?: number;
}>(), {
	modelValue: null,
	id: "integration1cReference",
	label: "",
	placeholder: "",
	invalid: false,
	error: null,
	disabled: false,
	required: false,
	showClear: true,
	minLength: 1,
	delay: 250,
});

const emit = defineEmits<{
	"update:modelValue": [value: Ref1C | null];
}>();

const inputValue = ref<Ref1C | string | null>(
	normalizeRef1C(props.modelValue),
);
const suggestions = ref<Integration1cSuggestion[]>([]);
const requestError = ref<string | null>(null);
let requestSequence = 0;
let preserveTypedTextOnExternalClear = false;

watch(
	() => props.modelValue,
	(value) => {
		if (preserveTypedTextOnExternalClear && value === null) {
			preserveTypedTextOnExternalClear = false;
			return;
		}

		inputValue.value = normalizeRef1C(value);
	},
	{ deep: true },
);

const complete = async (event: CompleteEvent): Promise<void> => {
	const query = event.query.trim();
	const sequence = ++requestSequence;

	requestError.value = null;

	if (query.length < props.minLength) {
		suggestions.value = [];
		return;
	}

	try {
		let nextSuggestions: Integration1cSuggestion[];
		if (props.catalogueType === "nomenclature") {
			const rows = await integration1cApi.completeNomenclature(query);
			nextSuggestions = rows.map((row) => ({
				id: row.id,
				descr: row.name,
			}));
		} else {
			const rows = await integration1cApi.completeCounterparties(query);
			nextSuggestions = rows.map((row) => ({
				id: row.id,
				descr: row.name,
				...(row.inn.trim().length > 0
					? { inn: row.inn.trim() }
					: {}),
			}));
		}

		if (sequence !== requestSequence) {
			return;
		}

		suggestions.value = nextSuggestions;
	} catch (err: unknown) {
		if (sequence !== requestSequence) {
			return;
		}

		suggestions.value = [];
		requestError.value = err instanceof Error
			? err.message
			: String(err);
	}
};

const updateInputValue = (
	value: Ref1C | string | null,
): void => {
	inputValue.value = value;

	if (typeof value === "string") {
		const selectedValue = normalizeRef1C(props.modelValue);

		if (selectedValue !== null && value !== selectedValue.descr) {
			preserveTypedTextOnExternalClear = true;
			emit("update:modelValue", null);
		}

		return;
	}

	if (value === null) {
		emit("update:modelValue", null);
		return;
	}

	requestSequence++;
	requestError.value = null;

	emit("update:modelValue", {
		id: value.id,
		descr: value.descr,
	});
};

const clear = (): void => {
	requestSequence++;
	inputValue.value = null;
	suggestions.value = [];
	requestError.value = null;
	emit("update:modelValue", null);
};

const hide = (): void => {
	suggestions.value = [];
};
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

		<AutoComplete
			:inputId="props.id"
			:modelValue="inputValue"
			:suggestions="suggestions"
			optionLabel="descr"
			:placeholder="props.placeholder"
			:invalid="props.invalid"
			:disabled="props.disabled"
			:required="props.required"
			:showClear="props.showClear"
			:minLength="props.minLength"
			:delay="props.delay"
			class="integration-1c-reference w-full"
			@complete="complete"
			@clear="clear"
			@hide="hide"
			@update:modelValue="updateInputValue"
		>
			<template #option="{ option }">
				<div class="integration-1c-reference-option">
					<span>{{ option.descr }}</span>
					<small v-if="option.inn">
						{{ option.inn }}
					</small>
				</div>
			</template>
		</AutoComplete>

		<small
			v-if="requestError || props.error"
			class="mt-1 block text-red-600"
		>
			{{ requestError || props.error }}
		</small>
	</div>
</template>

<style scoped>
.integration-1c-reference,
.integration-1c-reference :deep(.p-autocomplete-input) {
	width: 100%;
}

.integration-1c-reference-option {
	display: flex;
	flex-direction: column;
}

.integration-1c-reference-option small {
	color: var(--p-text-muted-color);
}
</style>
