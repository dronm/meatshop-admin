<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { orderLineCollection } from "@/collections/orderLineList";
import { createOrderCommands } from "@/collections/orderCommands";
import OrderBatchStatusDialog from "@/components/order/OrderBatchStatusDialog.vue";
import { useOrderBatchStatus } from "@/composables/useOrderBatchStatus";
import type { OrderLineListRow } from "@/types/orderLineList";

const { statusDialogVisible, statusOrderIDs, openStatusDialog, statusChanged } =
	useOrderBatchStatus();

const collection = {
	...orderLineCollection,
	commands: createOrderCommands<OrderLineListRow>(
		false,
		openStatusDialog,
	),
};
</script>

<template>
	<div class="order-lines-list">
		<CollectionListPage :collection="collection" />
		<OrderBatchStatusDialog
			v-model:visible="statusDialogVisible"
			:orderIDs="statusOrderIDs"
			@saved="statusChanged"
		/>
	</div>
</template>

<style scoped>
.order-lines-list :deep(.p-datatable-tbody > tr > td.order-line-group-start) {
	border-top: 3px solid #475569 !important;
}
</style>
