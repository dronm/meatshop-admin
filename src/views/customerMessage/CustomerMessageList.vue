<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
	CollectionGrid,
	FilterOperatorParam,
	SortDirect,
	type CollectionGridExpose,
	type CollectionParams,
	type GridCommand,
} from "@katren/vue-collection-lib";
import { customerMessageApi } from "@/api/customerMessage";
import { customerMessageCollection } from "@/collections/customerMessage.gen";
import CustomerMessageDetailDialog from "@/components/customerMessage/CustomerMessageDetailDialog.vue";
import { collectionGridOptions } from "@/config/collectionGrid";
import { useCustomerMessagesStore } from "@/stores/useCustomerMessagesStore";
import type { CustomerMessageKey } from "@/types/customerMessage.gen";
import type { CustomerMessageList } from "@/types/customerMessageList.gen";
import {
	customerMessageTarget,
	positiveMessageId,
} from "@/utils/customerMessage";
import { formatReference } from "@/utils/reference";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useCustomerMessagesStore();
const filter = ref("unread");
const grid = ref<CollectionGridExpose | null>(null);
const messageId = ref<number | null>(null);
const dialogVisible = ref(false);
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const api = {
	...customerMessageApi,
	list: async (params?: CollectionParams) => {
		const scoped: CollectionParams = {
			...params,
			filter: [...(params?.filter ?? [])],
		};
		if (filter.value === "unread") {
			scoped.filter?.push({
				f: {
					is_read: {
						o: FilterOperatorParam.E,
						v: false,
					},
				},
			});
		} else if (filter.value === "unassigned") {
			scoped.filter?.push({
				f: {
					customer_id: {
						o: FilterOperatorParam.I,
						v: null,
					},
				},
			});
		}
		return await customerMessageApi.list(scoped);
	},
};
const columns = customerMessageCollection.columns.map((column) =>
	column.field === "customer"
		? { ...column, format: formatReference }
		: column,
);
const commands = computed<
	GridCommand<CustomerMessageList, CustomerMessageKey>[]
>(() => [
	{
		name: "edit",
		labelKey: "CustomerMessage.open",
		icon: "pi pi-eye",
		enabled: (row) => row !== null,
		handler: ({ row }) => {
			if (row) {
				messageId.value = row.id;
				dialogVisible.value = true;
			}
		},
	},
	{
		name: "markRead",
		labelKey: "CustomerMessage.markSelectedRead",
		icon: "pi pi-check",
		enabled: (row) => row !== null,
		handler: async ({ rows, reload }) => {
			await store.markRead(rows.map((row) => row.id));
			await reload();
		},
	},
	{
		name: "customer",
		labelKey: "CustomerMessage.openCustomer",
		icon: "pi pi-user",
		enabled: (row) =>
			row?.customer_id !== null &&
			row?.customer_id !== undefined,
		handler: async ({ row }) => {
			if (row?.customer_id) {
				await router.push(
					customerMessageTarget(
						row.id,
						row.customer_id,
					),
				);
			}
		},
	},
	{ name: "search" },
	{ name: "refresh" },
]);
watch(
	() => route.query.message_id,
	(value) => {
		const id = positiveMessageId(value);
		if (id !== null) {
			messageId.value = id;
			dialogVisible.value = true;
		}
	},
	{ immediate: true },
);
watch(
	() => route.query.unread,
	(value) => {
		if (value === "1") {
			filter.value = "unread";
		}
	},
);
watch(
	() => store.revision,
	() => {
		if (refreshTimer !== null) {
			clearTimeout(refreshTimer);
		}
		refreshTimer = setTimeout(() => {
			refreshTimer = null;
			void grid.value?.load();
		}, 150);
	},
);
watch(dialogVisible, (visible) => {
	if (!visible && route.query.message_id !== undefined) {
		const query = { ...route.query };
		delete query.message_id;
		void router.replace({ query });
	}
});
onBeforeUnmount(() => {
	if (refreshTimer !== null) {
		clearTimeout(refreshTimer);
	}
});
const rowClass = (row: CustomerMessageList): string =>
	row.is_read ? "" : "customer-message-unread";
</script>

<template>
	<section class="customer-message-inbox">
		<div class="message-inbox-heading">
			<div>
				<h1>{{ t("CustomerMessage.title") }}</h1>
				<p>
					{{
						t(
							"CustomerMessage.unreadLabel",
							{
								count: store.unreadCount,
							},
						)
					}}
				</p>
			</div>
			<label
				><span>{{ t("CustomerMessage.show") }}</span
				><select v-model="filter">
					<option value="unread">
						{{
							t(
								"CustomerMessage.onlyUnread",
							)
						}}
					</option>
					<option value="all">
						{{ t("CustomerMessage.all") }}
					</option>
					<option value="unassigned">
						{{
							t(
								"CustomerMessage.unassigned",
							)
						}}
					</option>
				</select></label
			>
		</div>
		<p v-if="store.error" role="alert" class="message-inbox-error">
			{{ store.error }}
		</p>
		<CollectionGrid
			:key="`${store.userId}-${filter}`"
			ref="grid"
			v-bind="collectionGridOptions"
			:api="api"
			:columns="columns"
			:commands="commands"
			:get-key="(row) => ({ id: row.id })"
			:get-row-class="rowClass"
			:default-sorter="[{ f: 'id', d: SortDirect.DESC }]"
			:state-key="`customer-messages-${store.userId}-${filter}`"
			:page-size="30"
			data-key="id"
			commands-mode="replace"
			:auto-refresh-on-crud="false"
		>
			<template #body-text="{ value }"
				><span class="message-inbox-preview">{{
					value
				}}</span></template
			>
			<template #body-customer="{ value }">{{
				formatReference(value) ||
				t("CustomerMessage.unassigned")
			}}</template>
		</CollectionGrid>
		<CustomerMessageDetailDialog
			v-model:visible="dialogVisible"
			:message-id="messageId"
		/>
	</section>
</template>

<style scoped>
.message-inbox-heading {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 1rem;
}
.message-inbox-heading h1 {
	margin: 0;
	font-size: 1.45rem;
	font-weight: 650;
}
.message-inbox-heading p {
	margin: 0.3rem 0 0;
	color: #64748b;
	font-size: 0.85rem;
}
.message-inbox-heading label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.85rem;
}
.message-inbox-heading select {
	padding: 0.55rem 0.75rem;
	border: 1px solid #cbd5e1;
	border-radius: 0.4rem;
	background: white;
}
.message-inbox-preview {
	display: block;
	max-width: 36rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
:deep(.customer-message-unread) {
	font-weight: 600;
}
:deep(.customer-message-unread td:first-child) {
	box-shadow: inset 3px 0 #0284c7;
}
.message-inbox-error {
	color: #b91c1c;
	padding: 0.75rem;
	background: #fef2f2;
	border-radius: 0.5rem;
}
</style>
