<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import { isNavigationFailure, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import {
	useCustomerMessagesStore,
	type CustomerMessageNotice,
} from "@/stores/useCustomerMessagesStore";
import { customerMessageTarget } from "@/utils/customerMessage";

const { t } = useI18n();
const auth = useAuthStore();
const messages = useCustomerMessagesStore();
const router = useRouter();
watch(
	() =>
		auth.isAuthenticated() && auth.user?.role_id === "admin"
			? auth.user.id
			: null,
	(id) => {
		if (id === null) {
			messages.stop();
		} else {
			messages.start(id);
		}
	},
	{ immediate: true },
);
onBeforeUnmount(messages.stop);

const openNotice = async (notice: CustomerMessageNotice): Promise<void> => {
	const target =
		notice.messageId === null
			? { name: "customerMessages", query: { unread: "1" } }
			: customerMessageTarget(
					notice.messageId,
					notice.customerId,
				);
	const result = await router.push(target);
	if (!isNavigationFailure(result)) {
		messages.dismissNotice(notice.key);
	}
};
</script>

<template>
	<div class="customer-message-toolbar">
		<RouterLink
			:to="{ name: 'customerMessages' }"
			class="customer-message-toolbar-link"
			:aria-label="
				t('CustomerMessage.unreadLabel', {
					count: messages.unreadCount,
				})
			"
		>
			<i class="pi pi-comments" aria-hidden="true" />
			<span>{{ t("CustomerMessage.title") }}</span>
			<span
				class="customer-message-badge"
				:class="{
					'has-unread': messages.unreadCount > 0,
				}"
			>
				{{
					messages.countLoaded
						? messages.unreadCount
						: "—"
				}}
			</span>
		</RouterLink>
		<button
			v-if="messages.error"
			class="customer-message-retry"
			type="button"
			:title="messages.error"
			@click="messages.refresh(false, true)"
		>
			<i
				class="pi pi-exclamation-circle"
				aria-hidden="true"
			/>
			{{ t("CustomerMessage.refreshFailed") }}
		</button>
	</div>
	<Teleport to="body">
		<div
			class="customer-message-notices"
			aria-live="polite"
			aria-relevant="additions"
		>
			<article
				v-for="notice in messages.notices"
				:key="notice.key"
				class="customer-message-notice"
				role="status"
			>
				<div class="customer-message-notice-heading">
					<i
						class="pi pi-envelope"
						aria-hidden="true"
					/>
					<strong>{{
						notice.kind === "summary"
							? t(
									"CustomerMessage.unreadLabel",
									{
										count: notice.count,
									},
								)
							: t(
									"CustomerMessage.newMessage",
								)
					}}</strong>
					<button
						type="button"
						class="customer-message-notice-close"
						:aria-label="
							t(
								'CustomerMessage.dismiss',
							)
						"
						@click="
							messages.dismissNotice(
								notice.key,
							)
						"
					>
						<i
							class="pi pi-times"
							aria-hidden="true"
						/>
					</button>
				</div>
				<template v-if="notice.kind === 'message'">
					<div
						class="customer-message-notice-sender"
					>
						{{
							notice.customer ||
							t(
								"CustomerMessage.unassigned",
							)
						}}
						· {{ notice.sender }}
					</div>
					<p
						class="customer-message-notice-preview"
					>
						{{ notice.preview }}
					</p>
				</template>
				<p
					v-else
					class="customer-message-notice-preview"
				>
					{{ t("CustomerMessage.savedUnread") }}
				</p>
				<button
					type="button"
					class="customer-message-notice-open"
					@click="openNotice(notice)"
				>
					{{ t("CustomerMessage.open") }}
					<i
						class="pi pi-arrow-right"
						aria-hidden="true"
					/>
				</button>
			</article>
		</div>
	</Teleport>
</template>

<style scoped>
.customer-message-toolbar {
	position: sticky;
	top: 4rem;
	z-index: 40;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
	padding: 0.5rem max(1rem, calc((100vw - 1660px) / 2));
	background: #fff;
	border-bottom: 1px solid #e2e8f0;
}
.customer-message-toolbar-link {
	display: inline-flex;
	align-items: center;
	gap: 0.55rem;
	color: #334155;
	font-size: 0.875rem;
	font-weight: 600;
	text-decoration: none;
}
.customer-message-badge {
	min-width: 1.6rem;
	padding: 0.1rem 0.45rem;
	border-radius: 1rem;
	background: #e2e8f0;
	text-align: center;
	font-size: 0.75rem;
}
.customer-message-badge.has-unread {
	background: #0369a1;
	color: white;
}
.customer-message-retry {
	border: 0;
	background: transparent;
	color: #b45309;
	cursor: pointer;
	font-size: 0.8rem;
}
.customer-message-notices {
	position: fixed;
	z-index: 1200;
	bottom: 1rem;
	right: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	width: min(24rem, calc(100vw - 2rem));
	pointer-events: none;
	max-height: calc(100dvh - 2rem);
	overflow-y: auto;
}
.customer-message-notice {
	pointer-events: auto;
	padding: 1rem;
	border: 1px solid #bae6fd;
	border-left: 4px solid #0284c7;
	border-radius: 0.75rem;
	background: #fff;
	color: #0f172a;
	box-shadow: 0 10px 35px #0f172a26;
}
.customer-message-notice-heading {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
.customer-message-notice-close {
	margin-left: auto;
	padding: 0.3rem;
	border: 0;
	background: transparent;
	color: #64748b;
	cursor: pointer;
}
.customer-message-notice-sender {
	margin-top: 0.55rem;
	color: #475569;
	font-size: 0.85rem;
	overflow-wrap: anywhere;
}
.customer-message-notice-preview {
	margin: 0.5rem 0;
	font-size: 0.9rem;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}
.customer-message-notice-open {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	border: 0;
	padding: 0.3rem 0;
	color: #0369a1;
	background: transparent;
	font-weight: 600;
	cursor: pointer;
}
</style>
