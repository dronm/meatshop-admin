<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import Button from "primevue/button";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";

import { CollectionEditPage } from "@katren/vue-collection-lib";

import { orderDocumentApi } from "@/api/orderDocument";
import Integration1CJobGrid from "@/components/integration1c/Integration1CJobGrid.vue";
import OrderForm from "@/components/order/OrderForm.vue";
import { useDocumentEditPage } from "@/composables/useDocumentEditPage";
import { parseOrderDocument } from "@/schemas/orderDocument";
import {
	copyOrderDocumentFormModel,
	createOrderDocumentFormModel,
	orderDocumentToFormModel,
	orderFormModelToDocument,
} from "@/forms/orderDocument";
import type {
	OrderDetail,
	OrderDocument,
	OrderFormModel,
	OrderKey,
} from "@/types/orderDocument";
import {
	hasOrder1CReference,
	openOrderPrintPopup,
} from "@/utils/orderPrintPopup";

const { t } = useI18n();

const routeID = (value: unknown): number => {
	const id = Number(value ?? 0);
	return Number.isInteger(id) && id > 0 ? id : 0;
};

const edit = useDocumentEditPage<
	OrderFormModel,
	OrderKey,
	OrderDetail,
	OrderDocument
>({
	api: orderDocumentApi,
	createRouteName: "orderCreate",
	listRoute: { name: "orders" },
	keyFromRoute: (route) => ({
		id: routeID(route.params.id),
	}),
	keyFromDocument: (document) => ({
		id: document.id,
	}),
	copyKeyFromRoute: (route) => {
		const id = routeID(route.query.copy_id);
		return id > 0 ? { id } : null;
	},
	createModel: createOrderDocumentFormModel,
	fromDocument: orderDocumentToFormModel,
	copyModel: copyOrderDocumentFormModel,
	validate: (document) => parseOrderDocument(document),
});

const orderId = computed<number | null>(() => {
	const id = edit.model.value.id;
	return typeof id === "number" && id > 0 ? id : null;
});

const orderCorrelationPrefix = computed(() => {
	const id = orderId.value;

	return id === null
		? ""
		: `order:${id}:v`;
});

const integrationJobsKey = computed(() => {
	return `${orderId.value ?? 0}:${edit.model.value.version}`;
});

const printing = ref(false);
const canPrint = computed(() => {
	return orderId.value !== null
		&& hasOrder1CReference(edit.model.value.ref_1c);
});

const ref1C = computed(() => {
	const value = edit.model.value.ref_1c;
	if (value === null) {
		return null;
	}

	return value.id.length === 0 && value.descr.length === 0
		? null
		: value;
});

const printOrder = async (): Promise<void> => {
	const id = orderId.value;
	if (id === null || !canPrint.value) {
		return;
	}

	printing.value = true;
	try {
		await openOrderPrintPopup(id);
	} finally {
		printing.value = false;
	}
};

const submit = async (model: OrderFormModel): Promise<void> => {
	const document = orderFormModelToDocument(model, edit.mode.value);
	await edit.submit(document);
};
</script>

<template>
	<CollectionEditPage
		:title="t(`Order.form.${edit.mode.value}`)"
		:loading="edit.loading.value"
		@back="edit.goBack"
	>
		<div
			v-if="orderId !== null"
			class="mb-3 flex justify-end"
		>
			<Button
				:label="t('Order.actions.print')"
				icon="pi pi-print"
				severity="secondary"
				outlined
				:disabled="!canPrint"
				:loading="printing"
				@click="printOrder"
			/>
		</div>

		<Tabs value="document">
			<TabList>
				<Tab value="document">
					{{ t("Order.tabs.document") }}
				</Tab>
				<Tab
					value="integration-1c"
					:disabled="orderId === null"
				>
					{{ t("Order.tabs.integration1c") }}
				</Tab>
			</TabList>

			<TabPanels>
				<TabPanel value="document">
					<OrderForm
						v-if="!edit.loading.value"
						:model="edit.model.value"
						:mode="edit.mode.value"
						:errors="edit.errors"
						:submitting="edit.submitting.value"
						@submit="submit"
						@cancel="edit.goBack"
					/>
				</TabPanel>

				<TabPanel value="integration-1c">
					<div
						v-if="orderId === null"
						class="order-integration-placeholder"
					>
						{{ t("Order.integration1c.saveFirst") }}
					</div>

					<div
						v-else
						class="space-y-4"
					>
						<div class="order-integration-reference">
							<div class="order-integration-reference-title">
								{{ t("Order.integration1c.reference") }}
							</div>

							<div
								v-if="ref1C !== null"
								class="order-integration-reference-grid"
							>
								<div class="order-integration-label">
									{{ t("Order.integration1c.refDescr") }}
								</div>
								<div>
									{{ ref1C.descr || "—" }}
								</div>

								<div class="order-integration-label">
									{{ t("Order.integration1c.refId") }}
								</div>
								<div class="break-all font-mono text-sm">
									{{ ref1C.id || "—" }}
								</div>
							</div>

							<div
								v-else
								class="text-sm text-surface-500"
							>
								{{ t("Order.integration1c.noReference") }}
							</div>
						</div>

						<div>
							<div class="order-integration-jobs-title">
								{{ t("Order.integration1c.jobs") }}
							</div>

							<Integration1CJobGrid
								:key="integrationJobsKey"
								:correlationPrefix="orderCorrelationPrefix"
							/>
						</div>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>
	</CollectionEditPage>
</template>

<style scoped>
.order-integration-placeholder {
	border: 1px dashed var(--p-surface-300, #d1d5db);
	border-radius: 0.5rem;
	color: var(--p-text-muted-color, #6b7280);
	padding: 1rem;
}

.order-integration-reference {
	border: 1px solid var(--p-surface-200, #e5e7eb);
	border-radius: 0.5rem;
	padding: 1rem;
}

.order-integration-reference-title,
.order-integration-jobs-title {
	font-size: 1rem;
	font-weight: 600;
	margin-bottom: 0.75rem;
}

.order-integration-reference-grid {
	display: grid;
	gap: 0.5rem 1rem;
	grid-template-columns: minmax(8rem, auto) 1fr;
}

.order-integration-label {
	color: var(--p-text-muted-color, #6b7280);
	font-weight: 500;
}
</style>
