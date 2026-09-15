<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { maxOutMessageCollection } from "@/collections/maxOutMessage";
</script>

<template>
	<CollectionListPage :collection="maxOutMessageCollection" />
</template>
