<script setup lang="ts">
import {
	CollectionGrid,
	readCollectionGridState,
	writeCollectionGridState,
} from "@katren/vue-collection-lib";
import { useI18n } from "vue-i18n";
import ConfirmDialog from "primevue/confirmdialog";

import { orderLineCollection } from "@/collections/orderLineList";
import { createOrderLineCommands } from "@/collections/orderLineCommands";
import OrderBatchStatusDialog from "@/components/order/OrderBatchStatusDialog.vue";
import OrderWeightQuantity from "@/components/order/OrderWeightQuantity.vue";
import { useOrderBatchStatus } from "@/composables/useOrderBatchStatus";
import { useOrderLineRemovalConfirmation } from "@/composables/useOrderLineRemovalConfirmation";

const migrateOrderLineSelection = (): void => {
	const stateKey = orderLineCollection.stateKey;
	if (!stateKey) {
		return;
	}

	try {
		const migrationKey = `${stateKey}:line-keys-v1`;
		if (sessionStorage.getItem(migrationKey) !== null) {
			return;
		}

		const state = readCollectionGridState(stateKey);
		if (state) {
			// Previous keys identified whole orders; do not reuse them as line IDs.
			writeCollectionGridState(stateKey, {
				...state,
				selectedKey: undefined,
				markedKeys: [],
				markAnchorKey: undefined,
				selectedCell: undefined,
			});
		}
		sessionStorage.setItem(migrationKey, "1");
	} catch {
		// Keep the optional saved-selection migration from blocking the list.
	}
};

migrateOrderLineSelection();
const { t } = useI18n();

const {
	statusDialogVisible,
	statusOrderIDs,
	suggestedStatusID,
	openStatusDialog,
	statusChanged,
} = useOrderBatchStatus();

const { confirmRemoveLines } = useOrderLineRemovalConfirmation();

const collection = {
	...orderLineCollection,
	commands: createOrderLineCommands(openStatusDialog, confirmRemoveLines),
};
</script>

<template>
	<div class="order-lines-list">
		<section class="py-4">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h3 class="text-2xl font-semibold">{{ t(collection.titleKey) }}</h3>
			</div>
			<CollectionGrid
				:api="collection.api"
				:columns="collection.columns"
				:commands="collection.commands"
				:dataKey="collection.dataKey"
				:getKey="collection.getKey"
				:editMode="collection.editMode ?? 'page'"
				:createRow="collection.createRow"
				:createModel="collection.createModel"
				:baseParams="collection.baseParams"
				:defaultSorter="collection.defaultSorter"
				:hierarchy="collection.hierarchy"
				:routes="collection.routes"
				:stateKey="collection.stateKey"
				:pageSize="collection.pageSize ?? 30"
				:stickyHeader="collection.stickyHeader"
				:scrollHeight="collection.scrollHeight"
				:resizableColumns="collection.resizableColumns"
				:columnResizeMode="collection.columnResizeMode"
				:infiniteScroll="collection.infiniteScroll"
				:showCommandShortcuts="collection.showCommandShortcuts ?? true"
			>
				<template #body-quant="{ data }">
					<OrderWeightQuantity
						:quant="data.quant"
						:requiresWeightConfirmation="data.requires_weight_confirmation"
						:weightConfirmed="data.weight_confirmed"
					/>
				</template>
			</CollectionGrid>
		</section>
		<ConfirmDialog group="order-line-remove" />
		<OrderBatchStatusDialog
			v-model:visible="statusDialogVisible"
			:orderIDs="statusOrderIDs"
			:initialStatusID="suggestedStatusID"
			@saved="statusChanged"
		/>
	</div>
</template>

<style scoped>
.order-lines-list :deep(.p-datatable-tbody > tr > td.order-line-group-start) {
	border-top: 3px solid #475569 !important;
}
</style>
