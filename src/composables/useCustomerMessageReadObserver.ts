import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from "vue";
import { useCustomerMessagesStore } from "@/stores/useCustomerMessagesStore";
import {
	messageWindowIsActive,
	positiveMessageId,
} from "@/utils/customerMessage";

export const useCustomerMessageReadObserver = (
	root: Ref<HTMLElement | null>,
	active: () => boolean,
	contentVersion: () => unknown,
	onRead: (ids: number[]) => void,
	onError: (error: unknown) => void,
): { retry: () => void } => {
	const store = useCustomerMessagesStore();
	let observer: IntersectionObserver | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let generation = 0;
	const pending = new Set<number>();
	const acknowledged = new Set<number>();
	const visibleEnds = new Set<Element>();
	const inspect = (): void => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			void acknowledge();
		}, 350);
	};
	const acknowledge = async (): Promise<void> => {
		if (
			!active() ||
			!messageWindowIsActive() ||
			root.value === null ||
			store.userId === null
		) {
			return;
		}
		const ids = [
			...root.value.querySelectorAll<HTMLElement>(
				"[data-message-read]",
			),
		]
			.filter((element) => {
				if (
					observer !== null &&
					!visibleEnds.has(element)
				) {
					return false;
				}
				const bounds = element.getBoundingClientRect();
				const toolbarBottom =
					document
						.querySelector(
							".customer-message-toolbar",
						)
						?.getBoundingClientRect()
						.bottom ?? 0;
				return (
					element.getClientRects().length > 0 &&
					bounds.top >=
						Math.max(0, toolbarBottom) &&
					bounds.bottom <= window.innerHeight
				);
			})
			.map((element) =>
				positiveMessageId(element.dataset.messageRead),
			)
			.filter(
				(id): id is number =>
					id !== null &&
					!pending.has(id) &&
					!acknowledged.has(id),
			);
		if (ids.length === 0) {
			return;
		}
		const version = generation;
		ids.forEach((id) => pending.add(id));
		try {
			await store.markRead(ids);
			if (version === generation && active()) {
				ids.forEach((id) => acknowledged.add(id));
				onRead(ids);
			}
		} catch (error: unknown) {
			if (version === generation) {
				onError(error);
			}
		} finally {
			ids.forEach((id) => pending.delete(id));
		}
	};
	const reconnect = async (): Promise<void> => {
		generation += 1;
		acknowledged.clear();
		visibleEnds.clear();
		observer?.disconnect();
		await nextTick();
		if (root.value !== null && active() && observer !== null) {
			root.value
				.querySelectorAll("[data-message-read]")
				.forEach((element) =>
					observer?.observe(element),
				);
		}
		inspect();
	};
	watch(
		[root, active, contentVersion],
		() => {
			void reconnect();
		},
		{ flush: "post" },
	);
	onMounted(() => {
		if (typeof IntersectionObserver !== "undefined") {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (
							entry.isIntersecting &&
							entry.intersectionRatio ===
								1
						) {
							visibleEnds.add(
								entry.target,
							);
						} else {
							visibleEnds.delete(
								entry.target,
							);
						}
					}
					inspect();
				},
				{ threshold: 1 },
			);
		}
		window.addEventListener("focus", inspect);
		window.addEventListener("scroll", inspect, true);
		document.addEventListener("visibilitychange", inspect);
		void reconnect();
	});
	onBeforeUnmount(() => {
		generation += 1;
		observer?.disconnect();
		if (timer !== null) {
			clearTimeout(timer);
		}
		window.removeEventListener("focus", inspect);
		window.removeEventListener("scroll", inspect, true);
		document.removeEventListener("visibilitychange", inspect);
	});
	return { retry: inspect };
};
