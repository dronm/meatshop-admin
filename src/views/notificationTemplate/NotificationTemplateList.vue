<script setup lang="ts">
import { CollectionListPage } from "@katren/vue-collection-lib";

import { notificationTemplateCollection } from "@/collections/notificationTemplate";
</script>

<template>
	<CollectionListPage :collection="notificationTemplateCollection" />
</template>
