<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { customerMessageApi } from "@/api/customerMessage";
import { useCustomerMessageReadObserver } from "@/composables/useCustomerMessageReadObserver";
import type { CustomerMessage } from "@/types/customerMessage.gen";

const props = defineProps<{ messageId: number | null }>();
const visible = defineModel<boolean>("visible", { required: true });
const { t } = useI18n();
const router = useRouter();
const message = ref<CustomerMessage | null>(null);
const loading = ref(false);
const error = ref("");
const readError = ref("");
const acknowledged = ref(false);
const root = ref<HTMLElement | null>(null);
let requestId = 0;
const identity = computed(() => `${visible.value}:${props.messageId}`);
const load = async (): Promise<void> => {
	const request = ++requestId;
	message.value = null;
	error.value = "";
	readError.value = "";
	acknowledged.value = false;
	if (!visible.value || props.messageId === null) {
		loading.value = false;
		return;
	}
	loading.value = true;
	try {
		const result = await customerMessageApi.detail({
			id: props.messageId,
		});
		if (request === requestId) {
			message.value = result;
		}
	} catch (cause: unknown) {
		if (request === requestId) {
			error.value =
				cause instanceof Error
					? cause.message
					: String(cause);
		}
	} finally {
		if (request === requestId) {
			loading.value = false;
		}
	}
};
watch(
	identity,
	() => {
		void load();
	},
	{ immediate: true },
);
onBeforeUnmount(() => {
	requestId += 1;
});
const { retry } = useCustomerMessageReadObserver(
	root,
	() => visible.value && message.value !== null,
	() => message.value?.id,
	() => {
		acknowledged.value = true;
		readError.value = "";
	},
	(cause) => {
		readError.value =
			cause instanceof Error ? cause.message : String(cause);
	},
);
</script>

<template>
	<Dialog
		v-model:visible="visible"
		modal
		:header="t('CustomerMessage.messageTitle')"
		class="customer-message-dialog"
		:style="{ width: '44rem', maxWidth: 'calc(100vw - 2rem)' }"
	>
		<div v-if="loading" role="status">
			{{ t("CustomerMessage.loading") }}
		</div>
		<div
			v-else-if="error"
			role="alert"
			class="customer-message-error"
		>
			{{ error }}
			<Button
				:label="t('CustomerMessage.retry')"
				size="small"
				@click="load"
			/>
		</div>
		<div v-else-if="message" ref="root">
			<div class="message-detail-meta">
				<strong>{{ message.sender_name }}</strong>
				<time
					:datetime="
						message.sent_at.toISOString()
					"
					>{{
						message.sent_at.toLocaleString(
							"ru-RU",
						)
					}}</time
				>
			</div>
			<p class="message-detail-text">{{ message.text }}</p>
			<div
				:data-message-read="
					acknowledged ? undefined : message.id
				"
				class="message-read-end"
				aria-hidden="true"
			/>
			<div
				v-if="readError"
				role="alert"
				class="customer-message-error"
			>
				{{ t("CustomerMessage.readFailed") }}
				{{ readError }}
				<Button
					:label="t('CustomerMessage.retry')"
					size="small"
					@click="retry"
				/>
			</div>
			<div
				v-else-if="acknowledged"
				class="message-detail-read"
			>
				<i class="pi pi-check" aria-hidden="true" />
				{{ t("CustomerMessage.read") }}
			</div>
		</div>
		<template #footer>
			<Button
				v-if="message?.customer_id"
				:label="t('CustomerMessage.openCustomer')"
				icon="pi pi-user"
				severity="secondary"
				@click="
					router.push({
						name: 'customerEdit',
						params: {
							id: message.customer_id,
						},
						query: { tab: 'messages' },
					})
				"
			/>
			<Button
				:label="t('CustomerMessage.close')"
				severity="secondary"
				@click="visible = false"
			/>
		</template>
	</Dialog>
</template>

<style scoped>
.message-detail-meta {
	display: flex;
	gap: 0.5rem;
	justify-content: space-between;
	flex-wrap: wrap;
	color: #475569;
	font-size: 0.875rem;
}
.message-detail-text {
	margin: 1.25rem 0;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	line-height: 1.65;
}
.message-read-end {
	height: 1px;
}
.message-detail-read {
	color: #64748b;
	font-size: 0.8rem;
}
.customer-message-error {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem;
	color: #b91c1c;
	background: #fef2f2;
	border-radius: 0.5rem;
	overflow-wrap: anywhere;
}
</style>
