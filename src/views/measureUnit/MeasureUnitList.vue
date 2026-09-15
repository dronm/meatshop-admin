<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { measureUnitCollection } from "@/collections/measureUnit.gen";
</script>

<template>
	<CollectionListPage :collection="measureUnitCollection" />
</template>
