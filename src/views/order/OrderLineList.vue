<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { orderLineCollection } from "@/collections/orderLineList";
</script>

<template>
	<div class="order-lines-list">
		<CollectionListPage :collection="orderLineCollection" />
	</div>
</template>

<style scoped>
.order-lines-list :deep(.p-datatable-tbody > tr > td.order-line-group-start) {
	border-top: 3px solid #475569 !important;
}
</style>
