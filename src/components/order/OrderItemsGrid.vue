<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import Checkbox from "primevue/checkbox";

import {
	CollectionGrid,
	type GridColumn,
	type GridCommand,
} from "@katren/vue-collection-lib";

import { productApi } from "@/api/product.gen";
import OrderWeightQuantity from "@/components/order/OrderWeightQuantity.vue";
import { collectionGridOptions } from "@/config/collectionGrid";
import { useLocalDocumentCollection } from "@/composables/useLocalDocumentCollection";
import {
	measureUnitReference,
	productReference,
} from "@/references/productReferences";
import type { OrderFormItem } from "@/types/orderDocument";
import { normalizeOrderItemWeight } from "@/utils/orderWeight";

const props = withDefaults(defineProps<{
	modelValue?: OrderFormItem[];
}>(), {
	modelValue: () => [],
});

const emit = defineEmits<{
	"update:modelValue": [value: OrderFormItem[]];
}>();

const { t } = useI18n();
const rootEl = ref<HTMLElement | null>(null);
const productError = ref("");
let pendingSave: Promise<unknown> | null = null;
let saveFailed = false;

const items = computed<OrderFormItem[]>({
	get: () => props.modelValue,
	set: (value) => emit("update:modelValue", value),
});

const numberValue = (value: unknown): number => {
	return typeof value === "number" && Number.isFinite(value)
		? value
		: 0;
};

const updateProduct = async (
	row: OrderFormItem,
	value: unknown,
): Promise<void> => {
	const productID = numberValue(value);
	if (productID <= 0 || row.requires_weight_confirmation !== null) {
		return;
	}

	try {
		const product = await productApi.detail({ id: productID });
		if (row.product_id !== productID) {
			return;
		}

		if (row.measure_unit_id === 0) {
			row.measure_unit_id = product.measure_unit_id ?? 0;
		}
		row.requires_weight_confirmation = product.requires_weight_confirmation;
		productError.value = "";
	} catch {
		if (row.product_id === productID) {
			productError.value = t("Order.items.errors.productDetails");
		}
	}
};

const resetWeightConfirmation = (row: OrderFormItem): void => {
	row.weight_confirmed = false;
	row.weight_confirmation_requested = false;
};

const normalizeProduct = (value: unknown, row: OrderFormItem): number => {
	const productID = numberValue(value);
	if (productID !== row.product_id) {
		row.measure_unit_id = 0;
		row.requires_weight_confirmation = productID > 0 ? null : false;
		resetWeightConfirmation(row);
	}
	return productID;
};

const normalizeMeasureUnit = (value: unknown, row: OrderFormItem): number => {
	const measureUnitID = numberValue(value);
	if (measureUnitID !== row.measure_unit_id) {
		resetWeightConfirmation(row);
	}
	return measureUnitID;
};

const normalizeQuantRequired = (
	value: unknown,
	row: OrderFormItem,
): number => {
	const quant = numberValue(value);
	if (quant !== row.quant_required) {
		resetWeightConfirmation(row);
	}
	return quant;
};

const normalizeQuant = (value: unknown, row: OrderFormItem): number => {
	const quant = numberValue(value);
	if (quant !== row.quant) {
		row.weight_confirmed = true;
		row.weight_confirmation_requested = true;
	}
	return quant;
};

const columns: GridColumn<OrderFormItem>[] = [
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
		normalizeValue: normalizeProduct,
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
		normalizeValue: normalizeMeasureUnit,
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
		normalizeValue: normalizeQuantRequired,
		align: "right",
		width: "12rem",
		editorProps: {
			min: 0,
			minFractionDigits: 0,
			maxFractionDigits: 4,
		},
	},
	{
		field: "quant",
		headerKey: "Order.items.fields.quant",
		editable: true,
		dataType: "number",
		normalizeValue: normalizeQuant,
		align: "right",
		width: "12rem",
		editorProps: {
			min: 0,
			minFractionDigits: 0,
			maxFractionDigits: 4,
		},
	},
	{
		field: "weight_confirmation_requested",
		headerKey: "Order.items.fields.weight_confirmed",
		editable: true,
		dataType: "boolean",
		searchable: false,
		align: "center",
		width: "10rem",
	},
];

const commands: GridCommand<OrderFormItem, { id: number }>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "delete" },
	{ name: "refresh" },
];

const collection = useLocalDocumentCollection<OrderFormItem>({
	items,
	createDefaults: () => ({
		product_id: 0,
		measure_unit_id: 0,
		quant_required: 0,
		quant: 0,
		weight_confirmed: false,
		requires_weight_confirmation: false,
		weight_confirmation_requested: false,
	}),
});

const prepareItem = async (
	item: OrderFormItem,
	previous?: OrderFormItem,
): Promise<OrderFormItem> => {
	const prepared = { ...item };
	if (prepared.requires_weight_confirmation === null || previous?.product_id !== prepared.product_id) {
		try {
			const product = await productApi.detail({ id: prepared.product_id });
			prepared.requires_weight_confirmation = product.requires_weight_confirmation;
			if (prepared.measure_unit_id === 0) {
				prepared.measure_unit_id = product.measure_unit_id ?? 0;
			}
			productError.value = "";
		} catch {
			productError.value = t("Order.items.errors.productDetails");
			throw new Error(productError.value);
		}
	}
	return normalizeOrderItemWeight(prepared, previous);
};

const trackSave = <T,>(operation: () => Promise<T>): Promise<T> => {
	const request = operation();
	pendingSave = request;
	return request.then((result) => {
		saveFailed = false;
		return result;
	}, (error: unknown) => {
		saveFailed = true;
		throw error;
	}).finally(() => {
		if (pendingSave === request) {
			pendingSave = null;
		}
	});
};

const itemApi = {
	...collection.api,
	create: (item: OrderFormItem) => trackSave(async () => {
		return await collection.api.create!(await prepareItem(item));
	}),
	update: (key: { id: number }, patch: Partial<OrderFormItem>) => trackSave(async () => {
		const previous = items.value.find((item) => item.id === key.id);
		if (!previous) {
			throw new Error(`Document item ${key.id} was not found`);
		}
		const prepared = await prepareItem({ ...previous, ...patch }, previous);
		return await collection.api.update!(key, prepared);
	}),
};

const commitPendingEdit = async (): Promise<boolean> => {
	const saveButton = rootEl.value?.querySelector<HTMLButtonElement>(
		".p-datatable-row-editor-save",
	);
	if (saveButton) {
		saveButton.click();
	}
	const request = pendingSave;

	// CollectionGrid persists the PrimeVue row-edit draft through the local
	// document API. Wait until that cycle has propagated the new items array
	// back through v-model before the parent document is serialized.
	try {
		await request;
	} catch {
		return false;
	}
	await new Promise<void>((resolve) => {
		setTimeout(resolve, 0);
	});
	await nextTick();
	return !saveFailed && !rootEl.value?.querySelector(".p-datatable-row-editor-save");
};

const discardFailedEdit = (event: MouseEvent): void => {
	if (
		pendingSave === null
		&& event.target instanceof Element
		&& event.target.closest(".p-datatable-row-editor-cancel")
	) {
		saveFailed = false;
		productError.value = "";
	}
};

defineExpose({
	commitPendingEdit,
});

</script>

<template>
	<div ref="rootEl" class="space-y-2" @click.capture="discardFailedEdit">
		<h3 class="text-lg font-semibold">
			{{ t("Order.items.title") }}
		</h3>
		<p v-if="productError" role="alert" class="text-red-600">{{ productError }}</p>

		<CollectionGrid
			v-bind="collectionGridOptions"
			:api="itemApi"
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
		>
			<template #body-quant="{ data }">
				<OrderWeightQuantity
					:quant="data.quant"
					:requiresWeightConfirmation="data.requires_weight_confirmation"
					:weightConfirmed="data.weight_confirmed"
				/>
			</template>
			<template #body-weight_confirmation_requested="{ data }">
				<Checkbox
					v-if="data.requires_weight_confirmation && data.quant === data.quant_required"
					:modelValue="data.weight_confirmed"
					:aria-label="t('Order.items.fields.weight_confirmed')"
					binary
					disabled
				/>
			</template>
			<template #editor-weight_confirmation_requested="{ data }">
				<Checkbox
					v-if="data.requires_weight_confirmation && data.quant === data.quant_required"
					:modelValue="data.weight_confirmation_requested || data.weight_confirmed"
					:disabled="data.weight_confirmed"
					:aria-label="t('Order.items.fields.weight_confirmed')"
					binary
					@update:modelValue="data.weight_confirmation_requested = $event === true"
				/>
			</template>
		</CollectionGrid>
	</div>
</template>
