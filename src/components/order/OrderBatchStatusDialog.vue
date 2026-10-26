<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";

import { orderDocumentApi } from "@/api/orderDocument";
import OrderStatusReferenceInput from "@/components/references/OrderStatusReferenceInput.vue";

const props = defineProps<{
	visible: boolean;
	orderIDs: readonly number[];
}>();

const emit = defineEmits<{
	"update:visible": [visible: boolean];
	saved: [];
}>();

const { t } = useI18n();
const statusID = ref<number | null>(null);
const saving = ref(false);
const error = ref("");
const orderCount = computed(() => new Set(props.orderIDs).size);

const close = (): void => {
	if (!saving.value) {
		emit("update:visible", false);
	}
};

const save = async (): Promise<void> => {
	if (saving.value || statusID.value === null || orderCount.value === 0) {
		return;
	}

	saving.value = true;
	error.value = "";
	try {
		await orderDocumentApi.changeStatus(
			props.orderIDs,
			statusID.value,
		);
		emit("saved");
	} catch (cause: unknown) {
		error.value = errorText(cause);
	} finally {
		saving.value = false;
	}
};

watch(
	() => props.visible,
	(visible) => {
		if (visible) {
			statusID.value = null;
			error.value = "";
		}
	},
);
</script>

<template>
	<Dialog
		:visible="props.visible"
		:header="t('Order.actions.changeStatus')"
		modal
		:closable="!saving"
		:closeOnEscape="!saving"
		:dismissableMask="!saving"
		:style="{ width: '28rem', maxWidth: 'calc(100vw - 2rem)' }"
		@update:visible="close"
	>
		<form
			class="space-y-4"
			:aria-busy="saving"
			@submit.prevent="save"
		>
			<p>
				{{
					t("Order.batchStatus.selected", {
						count: orderCount,
					})
				}}
			</p>
			<p class="text-sm text-surface-600">
				{{ t("Order.batchStatus.wholeOrders") }}
			</p>
			<OrderStatusReferenceInput
				id="batchOrderStatus"
				v-model="statusID"
				:label="t('Order.batchStatus.newStatus')"
				:disabled="saving"
				:showClear="false"
			/>
			<Message
				v-if="error"
				severity="error"
				:closable="false"
			>
				{{ error }}
			</Message>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					:label="t('Grid.commands.cancel')"
					severity="secondary"
					:disabled="saving"
					@click="close"
				/>
				<Button
					type="submit"
					:label="t('Order.batchStatus.apply')"
					:loading="saving"
					:disabled="
						saving ||
						statusID === null ||
						orderCount === 0
					"
				/>
			</div>
		</form>
	</Dialog>
</template>
