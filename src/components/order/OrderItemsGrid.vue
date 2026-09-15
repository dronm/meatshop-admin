<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

import {
	CollectionGrid,
	type GridColumn,
	type GridCommand,
} from "@katren/vue-collection-lib";

import { productApi } from "@/api/product.gen";
import { useLocalDocumentCollection } from "@/composables/useLocalDocumentCollection";
import {
	measureUnitReference,
	productReference,
} from "@/references/productReferences";
import type { OrderDocumentItem } from "@/types/orderDocument";

const props = withDefaults(defineProps<{
	modelValue?: OrderDocumentItem[];
}>(), {
	modelValue: () => [],
});

const emit = defineEmits<{
	"update:modelValue": [value: OrderDocumentItem[]];
}>();

const { t } = useI18n();
const rootEl = ref<HTMLElement | null>(null);

const items = computed<OrderDocumentItem[]>({
	get: () => props.modelValue,
	set: (value) => emit("update:modelValue", value),
});

const numberValue = (value: unknown): number => {
	return typeof value === "number" && Number.isFinite(value)
		? value
		: 0;
};

const updateProduct = async (
	row: OrderDocumentItem,
	value: unknown,
): Promise<void> => {
	const productID = numberValue(value);
	row.product_id = productID;
	row.measure_unit_id = 0;

	if (productID <= 0) {
		return;
	}

	try {
		const product = await productApi.detail({ id: productID });
		if (row.product_id !== productID || row.measure_unit_id !== 0) {
			return;
		}

		row.measure_unit_id = product.measure_unit_id ?? 0;
	} catch {
		return;
	}
};

const updateQuantRequired = (
	row: OrderDocumentItem,
	value: unknown,
): void => {
	row.quant_required = numberValue(value);
};

const columns: GridColumn<OrderDocumentItem>[] = [
	{
		field: "line_num",
		headerKey: "Order.items.fields.line_num",
		sortable: true,
		editable: true,
		dataType: "number",
		normalizeValue: numberValue,
		align: "right",
		width: "6rem",
		editorProps: {
			min: 1,
			useGrouping: false,
		},
	},
	{
		field: "product_id",
		headerKey: "Order.items.fields.product_id",
		editable: true,
		dataType: "reference",
		normalizeValue: numberValue,
		reference: productReference,
		searchable: false,
		width: "28rem",
		editorProps: {
			required: true,
		},
		setValue: updateProduct,
	},
	{
		field: "measure_unit_id",
		headerKey: "Order.items.fields.measure_unit_id",
		editable: true,
		dataType: "reference",
		normalizeValue: numberValue,
		reference: measureUnitReference,
		searchable: false,
		width: "14rem",
		editorProps: {
			required: true,
		},
	},
	{
		field: "quant_required",
		headerKey: "Order.items.fields.quant_required",
		editable: true,
		dataType: "number",
		normalizeValue: numberValue,
		align: "right",
		width: "12rem",
		editorProps: {
			min: 0,
			minFractionDigits: 0,
			maxFractionDigits: 4,
		},
		setValue: updateQuantRequired,
	},
	{
		field: "quant",
		headerKey: "Order.items.fields.quant",
		editable: true,
		dataType: "number",
		normalizeValue: numberValue,
		align: "right",
		width: "12rem",
		editorProps: {
			min: 0,
			minFractionDigits: 0,
			maxFractionDigits: 4,
		},
	},
];

const commands: GridCommand<OrderDocumentItem, { id: number }>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "delete" },
	{ name: "refresh" },
];

const collection = useLocalDocumentCollection<OrderDocumentItem>({
	items,
	createDefaults: () => ({
		product_id: 0,
		measure_unit_id: 0,
		quant_required: 0,
		quant: 0,
	}),
});
const commitPendingEdit = async (): Promise<void> => {
	const saveButton = rootEl.value?.querySelector<HTMLButtonElement>(
		".p-datatable-row-editor-save",
	);
	if (!saveButton) {
		return;
	}

	saveButton.click();

	// CollectionGrid persists the PrimeVue row-edit draft through the local
	// document API. Wait until that cycle has propagated the new items array
	// back through v-model before the parent document is serialized.
	await nextTick();
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 0);
	});
	await nextTick();
};

defineExpose({
	commitPendingEdit,
});

</script>

<template>
	<div ref="rootEl" class="space-y-2">
		<h3 class="text-lg font-semibold">
			{{ t("Order.items.title") }}
		</h3>

		<CollectionGrid
			:api="collection.api"
			:columns="columns"
			:commands="commands"
			dataKey="id"
			:getKey="collection.getKey"
			:createRow="collection.createRow"
			:createModel="collection.createModel"
			editMode="inline"
			:defaultSorter="collection.defaultSorter"
			:pageSize="100"
			:showCommandShortcuts="false"
		/>
	</div>
</template>
