<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { customerCollection } from "@/collections/customer.gen";
</script>

<template>
	<CollectionListPage :collection="customerCollection" />
</template>
