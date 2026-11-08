<script setup lang="ts">
import {
	CollectionListPage,
	readCollectionGridState,
	SortDirect,
	writeCollectionGridState,
} from "@katren/vue-collection-lib";

import { orderCollection } from "@/collections/order";
import { createOrderCommands } from "@/collections/orderCommands";
import OrderBatchStatusDialog from "@/components/order/OrderBatchStatusDialog.vue";
import { useOrderBatchStatus } from "@/composables/useOrderBatchStatus";
import type { OrderList } from "@/types/orderList.gen";

const migrateOrderSorter = (): void => {
	const stateKey = orderCollection.stateKey;
	if (!stateKey) {
		return;
	}

	try {
		const migrationKey = `${stateKey}:sort-id-desc-v1`;
		if (sessionStorage.getItem(migrationKey) !== null) {
			return;
		}

		const state = readCollectionGridState(stateKey);
		if (
			state?.sorter?.length === 1 &&
			state.sorter[0]?.f === "for_date" &&
			state.sorter[0]?.d === SortDirect.DESC
		) {
			writeCollectionGridState(stateKey, {
				...state,
				first: 0,
				sorter: [{ f: "id", d: SortDirect.DESC }],
			});
		}

		sessionStorage.setItem(migrationKey, "1");
	} catch {
		// Keep this optional migration from blocking page initialization.
	}
};

migrateOrderSorter();

const {
	statusDialogVisible,
	statusOrderIDs,
	suggestedStatusID,
	openStatusDialog,
	statusChanged,
} = useOrderBatchStatus();

const collection = {
	...orderCollection,
	commands: createOrderCommands<OrderList>(true, openStatusDialog),
};
</script>

<template>
	<CollectionListPage :collection="collection" />
	<OrderBatchStatusDialog
		v-model:visible="statusDialogVisible"
		:orderIDs="statusOrderIDs"
		:initialStatusID="suggestedStatusID"
		@saved="statusChanged"
	/>
</template>
