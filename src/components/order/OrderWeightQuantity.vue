<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { isWeightConfirmationPending } from "@/utils/orderWeight";

const props = defineProps<{
	quant: number;
	requiresWeightConfirmation: boolean | null;
	weightConfirmed: boolean;
}>();

const { t } = useI18n();
const pending = computed(() => isWeightConfirmationPending({
	quant: props.quant,
	requires_weight_confirmation: props.requiresWeightConfirmation,
	weight_confirmed: props.weightConfirmed,
}));
const quantity = computed(() => new Intl.NumberFormat("ru-RU", {
	maximumFractionDigits: 4,
}).format(props.quant));
</script>

<template>
	<span
		:class="{ 'order-weight-pending': pending }"
		:title="pending ? t('Order.items.weightPending') : undefined"
	>{{ quantity }}</span>
</template>

<style scoped>
.order-weight-pending {
	color: #dc2626;
}
</style>
