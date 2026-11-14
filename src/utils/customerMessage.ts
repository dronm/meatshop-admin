import type { RouteLocationRaw } from "vue-router";

export const positiveMessageId = (value: unknown): number | null => {
	if (typeof value !== "string" && typeof value !== "number") {
		return null;
	}
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const customerMessageTarget = (
	id: number,
	customerId: number | null,
): RouteLocationRaw => {
	return customerId === null
		? { name: "customerMessages", query: { message_id: id } }
		: {
				name: "customerEdit",
				params: { id: customerId },
				query: { tab: "messages", message_id: id },
			};
};

export const messageWindowIsActive = (): boolean => {
	return document.visibilityState === "visible" && document.hasFocus();
};

// Web Locks makes the claim atomic between independent tabs. Only notice IDs
// are persisted; server-side read status remains independent of notification UI.
export const claimCustomerMessageNotice = async (
	userId: number,
	noticeId: string,
): Promise<boolean> => {
	const key = `meatshop:message-notices:${userId}`;
	const claim = (): boolean => {
		try {
			const stored: unknown = JSON.parse(
				localStorage.getItem(key) ?? "[]",
			);
			const ids = Array.isArray(stored)
				? stored.filter(
						(id): id is string =>
							typeof id === "string",
					)
				: [];
			if (ids.includes(noticeId)) {
				return false;
			}
			localStorage.setItem(
				key,
				JSON.stringify([...ids.slice(-199), noticeId]),
			);
		} catch {
			// Restricted browser storage must not prevent an in-memory notice.
		}
		return true;
	};
	if (navigator.locks) {
		return await navigator.locks.request(key, claim);
	}
	return claim();
};
