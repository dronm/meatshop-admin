<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { orderCollection } from "@/collections/order";
</script>

<template>
	<CollectionListPage :collection="orderCollection" />
</template>
