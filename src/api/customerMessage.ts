import api from "@/api/http";
import { customerMessageApi as generatedApi } from "@/api/customerMessage.gen";

export const customerMessageApi = {
	serviceName: generatedApi.serviceName,
	list: generatedApi.list,
	detail: generatedApi.detail,
	unreadCount: async (customerId?: number): Promise<number> => {
		const result = await api.get<{ unread_count: number }>(
			"/customer-messages/unread-count",
			customerId === undefined
				? undefined
				: { customer_id: String(customerId) },
		);
		return result.unread_count;
	},
	markRead: async (messageIds: readonly number[]): Promise<void> => {
		const ids = [...new Set(messageIds)];
		for (let from = 0; from < ids.length; from += 500) {
			await api.post("/customer-messages/mark-read", {
				message_ids: ids.slice(from, from + 500),
			});
		}
	},
};
