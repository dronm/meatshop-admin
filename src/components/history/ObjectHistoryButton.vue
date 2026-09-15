<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { ObjectHistoryDialog } from "@katren/vue-business-app/object-history";
import Button from "primevue/button";

const props = withDefaults(
	defineProps<{
		objectType: string;
		objectId: string | number | null | undefined;
		disabled?: boolean;
	}>(),
	{
		disabled: false,
	},
);

const { t } = useI18n();
const historyVisible = ref(false);

const available = computed(() => {
	return (
		!props.disabled &&
		props.objectType.trim() !== "" &&
		props.objectId !== null &&
		props.objectId !== undefined &&
		String(props.objectId).trim() !== "" &&
		String(props.objectId) !== "0"
	);
});

const openHistory = (): void => {
	if (available.value) {
		historyVisible.value = true;
	}
};
</script>

<template>
	<Button
		type="button"
		:label="t('Grid.commands.history')"
		icon="pi pi-history"
		severity="secondary"
		outlined
		:disabled="!available"
		@click="openHistory"
	/>

	<ObjectHistoryDialog
		v-model:visible="historyVisible"
		:object-type="props.objectType"
		:object-id="props.objectId"
	/>
</template>
