<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import {
	FilterOperatorParam,
	SortDirect,
	type CollectionParams,
} from "@katren/vue-collection-lib";
import { customerMessageApi } from "@/api/customerMessage";
import CustomerMessageDetailDialog from "@/components/customerMessage/CustomerMessageDetailDialog.vue";
import { useCustomerMessageReadObserver } from "@/composables/useCustomerMessageReadObserver";
import { useCustomerMessagesStore } from "@/stores/useCustomerMessagesStore";
import type { CustomerMessageList } from "@/types/customerMessageList.gen";

const props = defineProps<{
	customerId: number;
	active: boolean;
	focusMessageId: number | null;
}>();
const emit = defineEmits<{ closeFocusedMessage: [] }>();
const { t } = useI18n();
const store = useCustomerMessagesStore();
const root = ref<HTMLElement | null>(null);
const rows = ref<CustomerMessageList[]>([]);
const total = ref(0);
const from = ref(0);
const search = ref("");
const loading = ref(false);
const error = ref("");
const readError = ref("");
const dialogVisible = ref(false);
const pageSize = 30;
let requestId = 0;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const load = async (): Promise<void> => {
	if (!props.active) {
		return;
	}
	const request = ++requestId;
	loading.value = true;
	error.value = "";
	const params: CollectionParams = {
		from: from.value,
		count: pageSize,
		sorter: [{ f: "id", d: SortDirect.DESC }],
		filter: [
			{
				f: {
					customer_id: {
						o: FilterOperatorParam.E,
						v: props.customerId,
					},
				},
			},
		],
	};
	if (search.value.trim()) {
		params.filter?.push({
			f: {
				text: {
					o: FilterOperatorParam.ILK,
					v: `%${search.value.trim()}%`,
				},
			},
		});
	}
	try {
		const result = await customerMessageApi.list(params);
		if (request !== requestId || !props.active) {
			return;
		}
		rows.value = result.rows;
		total.value = Number(
			result.agg?.tot_count ?? result.rows.length,
		);
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
const scheduleLoad = (): void => {
	if (refreshTimer !== null) {
		clearTimeout(refreshTimer);
	}
	refreshTimer = setTimeout(() => {
		refreshTimer = null;
		void load();
	}, 150);
};
watch(
	() => props.customerId,
	() => {
		from.value = 0;
		rows.value = [];
		scheduleLoad();
	},
);
watch([() => props.active, () => store.revision, from], scheduleLoad, {
	immediate: true,
});
watch(search, () => {
	from.value = 0;
	scheduleLoad();
});
watch(
	() => props.active,
	(active) => {
		if (!active) {
			requestId += 1;
			loading.value = false;
			dialogVisible.value = false;
		}
	},
);
watch(
	[() => props.focusMessageId, () => props.active],
	([id, active]) => {
		if (id !== null && active) {
			dialogVisible.value = true;
		}
	},
	{ immediate: true },
);
onBeforeUnmount(() => {
	requestId += 1;
	if (refreshTimer !== null) {
		clearTimeout(refreshTimer);
	}
});
const contentVersion = computed(() => rows.value);
const { retry } = useCustomerMessageReadObserver(
	root,
	() =>
		props.active &&
		!loading.value &&
		!error.value &&
		!dialogVisible.value,
	() => contentVersion.value,
	(ids) => {
		rows.value.forEach((row) => {
			if (ids.includes(row.id)) {
				row.is_read = true;
			}
		});
		readError.value = "";
	},
	(cause) => {
		readError.value =
			cause instanceof Error ? cause.message : String(cause);
	},
);
</script>

<template>
	<section
		ref="root"
		class="customer-messages-panel"
		:aria-label="t('CustomerMessage.history')"
	>
		<div class="customer-messages-panel-toolbar">
			<label class="message-search"
				><span>{{
					t("CustomerMessage.searchText")
				}}</span
				><InputText
					v-model="search"
					:placeholder="
						t(
							'CustomerMessage.searchPlaceholder',
						)
					"
			/></label>
			<Button
				:label="t('CustomerMessage.refresh')"
				icon="pi pi-refresh"
				severity="secondary"
				:loading="loading"
				@click="load"
			/>
		</div>
		<div v-if="error" class="message-panel-error" role="alert">
			{{ error }}
			<Button
				:label="t('CustomerMessage.retry')"
				size="small"
				@click="load"
			/>
		</div>
		<div v-if="readError" class="message-panel-error" role="alert">
			{{ t("CustomerMessage.readFailed") }} {{ readError }}
			<Button
				:label="t('CustomerMessage.retry')"
				size="small"
				@click="retry"
			/>
		</div>
		<div v-if="loading" role="status" class="message-panel-status">
			{{ t("CustomerMessage.loading") }}
		</div>
		<div
			v-else-if="!error && rows.length === 0"
			class="message-panel-empty"
		>
			{{
				t(
					search
						? "CustomerMessage.noMatches"
						: "CustomerMessage.noCustomerMessages",
				)
			}}
		</div>
		<div v-if="!error" class="message-history" :aria-busy="loading">
			<article
				v-for="message in rows"
				:key="message.id"
				class="message-history-card"
				:class="{
					'message-history-unread':
						!message.is_read,
				}"
			>
				<div class="message-history-heading">
					<strong>{{
						message.sender_name
					}}</strong
					><span
						v-if="!message.is_read"
						class="message-history-new"
						>{{
							t(
								"CustomerMessage.unread",
							)
						}}</span
					><time
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
				<p>{{ message.text }}</p>
				<div
					:data-message-read="
						message.is_read
							? undefined
							: message.id
					"
					class="message-read-end"
					aria-hidden="true"
				/>
			</article>
		</div>
		<div v-if="total > pageSize" class="message-history-paging">
			<Button
				:label="t('CustomerMessage.previous')"
				icon="pi pi-angle-left"
				severity="secondary"
				:disabled="from === 0 || loading"
				@click="from = Math.max(0, from - pageSize)"
			/>
			<span
				>{{ from + 1 }}–{{
					Math.min(from + pageSize, total)
				}}
				/ {{ total }}</span
			>
			<Button
				:label="t('CustomerMessage.next')"
				icon="pi pi-angle-right"
				icon-pos="right"
				severity="secondary"
				:disabled="from + pageSize >= total || loading"
				@click="from += pageSize"
			/>
		</div>
		<CustomerMessageDetailDialog
			v-model:visible="dialogVisible"
			:message-id="focusMessageId"
			@update:visible="
				(visible) => {
					if (!visible) {
						emit('closeFocusedMessage');
					}
				}
			"
		/>
	</section>
</template>

<style scoped>
.customer-messages-panel-toolbar {
	display: flex;
	align-items: end;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
	margin-bottom: 1rem;
}
.message-search {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	font-size: 0.85rem;
	min-width: min(22rem, 100%);
}
.message-history {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.message-history-card {
	padding: 1rem 1.25rem;
	border: 1px solid #e2e8f0;
	border-left: 3px solid #cbd5e1;
	border-radius: 0.65rem;
	background: #fff;
}
.message-history-unread {
	border-left-color: #0284c7;
	background: #f0f9ff;
}
.message-history-heading {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.message-history-heading time {
	margin-left: auto;
	color: #64748b;
	font-size: 0.8rem;
}
.message-history-new {
	padding: 0.1rem 0.4rem;
	border-radius: 1rem;
	background: #e0f2fe;
	color: #0369a1;
	font-size: 0.7rem;
}
.message-history-card p {
	margin: 0.8rem 0 0;
	line-height: 1.65;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}
.message-read-end {
	height: 1px;
}
.message-history-paging {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	margin-top: 1rem;
	font-size: 0.85rem;
}
.message-panel-error {
	margin: 0.75rem 0;
	padding: 0.75rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: #fef2f2;
	color: #b91c1c;
	border-radius: 0.5rem;
}
.message-panel-status,
.message-panel-empty {
	padding: 2rem;
	text-align: center;
	color: #64748b;
}
</style>
