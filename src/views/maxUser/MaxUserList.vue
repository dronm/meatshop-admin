<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { maxUserCollection } from "@/collections/maxUser.gen";
</script>

<template>
	<CollectionListPage :collection="maxUserCollection" />
</template>
