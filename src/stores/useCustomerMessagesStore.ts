import { defineStore } from "pinia";
import { ref } from "vue";
import { FilterOperatorParam } from "@katren/vue-collection-lib";
import { customerMessageApi } from "@/api/customerMessage";
import wsManager from "@/api/wsConn";
import {
	claimCustomerMessageNotice,
	positiveMessageId,
} from "@/utils/customerMessage";
import { formatReference } from "@/utils/reference";

export interface CustomerMessageNotice {
	key: string;
	kind: "message" | "summary";
	messageId: number | null;
	customerId: number | null;
	sender: string;
	customer: string;
	preview: string;
	count: number;
}

export const useCustomerMessagesStore = defineStore("customerMessages", () => {
	const userId = ref<number | null>(null);
	const unreadCount = ref(0);
	const countLoaded = ref(false);
	const error = ref("");
	const revision = ref(0);
	const notices = ref<CustomerMessageNotice[]>([]);
	let epoch = 0;
	let requestId = 0;
	let subscription: string | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let refreshTimer: ReturnType<typeof setTimeout> | null = null;
	let channel: BroadcastChannel | null = null;
	const notified = new Set<number>();
	const pendingReads = new Map<number, Promise<void>>();

	const dismissNotice = (key: string): void => {
		notices.value = notices.value.filter(
			(notice) => notice.key !== key,
		);
	};
	const addNotice = (notice: CustomerMessageNotice): void => {
		notices.value = [
			...notices.value
				.filter((item) => item.key !== notice.key)
				.slice(-3),
			notice,
		];
	};
	const refresh = async (
		announce = false,
		invalidate = false,
	): Promise<void> => {
		const identity = userId.value;
		if (identity === null) {
			return;
		}
		const version = epoch;
		const request = ++requestId;
		try {
			const count = await customerMessageApi.unreadCount();
			if (version !== epoch || request !== requestId) {
				return;
			}
			const changed = unreadCount.value !== count;
			unreadCount.value = count;
			countLoaded.value = true;
			error.value = "";
			if (changed || invalidate) {
				revision.value += 1;
			}
			if (count === 0) {
				notices.value = notices.value.filter(
					(notice) => notice.kind !== "summary",
				);
			} else {
				notices.value = notices.value.map((notice) =>
					notice.kind === "summary"
						? { ...notice, count }
						: notice,
				);
			}
			if (announce && count > 0) {
				const latest = await customerMessageApi.list({
					filter: [
						{
							f: {
								is_read: {
									o: FilterOperatorParam.E,
									v: false,
								},
							},
						},
					],
					count: 1,
				});
				const latestId = latest.rows[0]?.id;
				if (
					version !== epoch ||
					request !== requestId ||
					latestId === undefined
				) {
					return;
				}
				if (
					(await claimCustomerMessageNotice(
						identity,
						`summary:${latestId}:${count}`,
					)) &&
					version === epoch
				) {
					addNotice({
						key: "summary",
						kind: "summary",
						count,
						messageId: null,
						customerId: null,
						sender: "",
						customer: "",
						preview: "",
					});
				}
			}
		} catch (cause: unknown) {
			if (version === epoch && request === requestId) {
				error.value =
					cause instanceof Error
						? cause.message
						: String(cause);
			}
		}
	};
	const scheduleRefresh = (): void => {
		if (refreshTimer !== null) {
			clearTimeout(refreshTimer);
		}
		refreshTimer = setTimeout(() => {
			refreshTimer = null;
			void refresh();
		}, 100);
	};
	const showMessageNotice = async (id: number): Promise<void> => {
		const identity = userId.value;
		if (identity === null || notified.has(id)) {
			return;
		}
		notified.add(id);
		const version = epoch;
		try {
			const result = await customerMessageApi.list({
				filter: [
					{
						f: {
							id: {
								o: FilterOperatorParam.E,
								v: id,
							},
							is_read: {
								o: FilterOperatorParam.E,
								v: false,
							},
						},
					},
				],
				count: 1,
			});
			const message = result.rows[0];
			if (!message || version !== epoch) {
				return;
			}
			if (
				(await claimCustomerMessageNotice(
					identity,
					`message:${id}`,
				)) &&
				version === epoch
			) {
				addNotice({
					key: `message:${id}`,
					kind: "message",
					count: 0,
					messageId: id,
					customerId: message.customer_id,
					sender: message.sender_name,
					customer: formatReference(
						message.customer,
					),
					preview: message.text.slice(0, 180),
				});
			}
		} catch {
			// The persisted inbox and next count refresh recover a failed preview.
			if (version === epoch) {
				notified.delete(id);
			}
		}
	};
	const onEvent = (eventId: string, payload: unknown): void => {
		if (userId.value === null) {
			return;
		}
		const data =
			typeof payload === "object" && payload !== null
				? (payload as Record<string, unknown>)
				: {};
		if (
			eventId === "CustomerMessage.Read" &&
			data.user_id !== userId.value
		) {
			return;
		}
		revision.value += 1;
		scheduleRefresh();
		if (eventId === "CustomerMessage.Create") {
			const id = positiveMessageId(data.id);
			if (id !== null) {
				void showMessageNotice(id);
			}
		}
	};
	const onWake = (): void => {
		if (
			document.visibilityState === "visible" &&
			userId.value !== null
		) {
			wsManager.connect();
			void refresh(true, true);
		}
	};
	const stop = (): void => {
		epoch += 1;
		requestId += 1;
		if (subscription !== null) {
			wsManager.unsubscribe(subscription);
		}
		subscription = null;
		if (pollTimer !== null) {
			clearInterval(pollTimer);
		}
		if (refreshTimer !== null) {
			clearTimeout(refreshTimer);
		}
		pollTimer = null;
		refreshTimer = null;
		window.removeEventListener("focus", onWake);
		document.removeEventListener("visibilitychange", onWake);
		channel?.close();
		channel = null;
		userId.value = null;
		unreadCount.value = 0;
		countLoaded.value = false;
		error.value = "";
		notices.value = [];
		notified.clear();
		pendingReads.clear();
	};
	const start = (identity: number): void => {
		if (identity === userId.value) {
			return;
		}
		stop();
		userId.value = identity;
		subscription = wsManager.subscribe({
			events: [
				"CustomerMessage.Create",
				"CustomerMessage.Update",
				"CustomerMessage.Read",
			],
			onEvent,
			onSubscribed: () => {
				void refresh(true, true);
			},
		});
		if (typeof BroadcastChannel !== "undefined") {
			channel = new BroadcastChannel(
				"meatshop-customer-messages",
			);
			channel.onmessage = (
				event: MessageEvent<unknown>,
			): void => {
				const data = event.data as {
					user_id?: unknown;
					type?: unknown;
				} | null;
				if (
					data?.user_id === userId.value &&
					data?.type === "read"
				) {
					void refresh(false, true);
				}
			};
		}
		window.addEventListener("focus", onWake);
		document.addEventListener("visibilitychange", onWake);
		pollTimer = setInterval(() => {
			if (document.visibilityState === "visible") {
				void refresh(false, !wsManager.isConnected());
			}
		}, 30000);
		void refresh(true);
	};
	const markRead = async (
		messageIds: readonly number[],
	): Promise<void> => {
		if (userId.value === null) {
			return;
		}
		const version = epoch;
		const ids = [...new Set(messageIds)];
		const waiting = ids
			.map((id) => pendingReads.get(id))
			.filter(
				(item): item is Promise<void> =>
					item !== undefined,
			);
		const fresh = ids.filter((id) => !pendingReads.has(id));
		if (fresh.length > 0) {
			const operation = customerMessageApi
				.markRead(fresh)
				.then(() => {
					if (version === epoch) {
						notices.value =
							notices.value.filter(
								(notice) =>
									notice.messageId ===
										null ||
									!fresh.includes(
										notice.messageId,
									),
							);
						revision.value += 1;
						channel?.postMessage({
							type: "read",
							user_id: userId.value,
						});
						void refresh();
					}
				})
				.finally(() => {
					if (version === epoch) {
						fresh.forEach((id) =>
							pendingReads.delete(id),
						);
					}
				});
			fresh.forEach((id) => pendingReads.set(id, operation));
			waiting.push(operation);
		}
		await Promise.all(waiting);
	};
	return {
		userId,
		unreadCount,
		countLoaded,
		error,
		revision,
		notices,
		start,
		stop,
		refresh,
		markRead,
		dismissNotice,
	};
});
