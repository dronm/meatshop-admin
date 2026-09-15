<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { maxInMessageCollection } from "@/collections/maxInMessage";
</script>

<template>
	<CollectionListPage :collection="maxInMessageCollection" />
</template>
