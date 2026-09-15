import {
	defineCrudReference,
	type CollectionParams,
	type CollectionResponse,
} from "@katren/vue-collection-lib";

import { maxUserApi } from "@/api/maxUser.gen";
import type { MaxUser } from "@/types/maxUser.gen";
import type { MaxUserList } from "@/types/maxUserList.gen";

export type MaxUserReferenceKey = {
	id: number;
};

type MaxUserReferenceRow = {
	id: number;
	username: string | null;
	max_user_id: number;
	descr: string;
};

const maxUserDescr = (row: Pick<MaxUserList | MaxUser, "username" | "max_user_id">): string => {
	const username = row.username?.trim() ?? "";
	return username !== "" ? username : String(row.max_user_id);
};

const toReferenceRow = (
	row: Pick<MaxUserList | MaxUser, "id" | "username" | "max_user_id">,
): MaxUserReferenceRow => ({
	id: row.id,
	username: row.username,
	max_user_id: row.max_user_id,
	descr: maxUserDescr(row),
});

export const maxUserReference = defineCrudReference<
	MaxUserReferenceRow,
	MaxUserReferenceKey,
	number
>({
	list: async (params?: CollectionParams): Promise<CollectionResponse<MaxUserReferenceRow>> => {
		const response = await maxUserApi.list(params);
		return {
			rows: response.rows.map(toReferenceRow),
			agg: response.agg,
		};
	},
	detail: async (key) => {
		return toReferenceRow(await maxUserApi.detail(key));
	},
	keyField: "id",
	searchField: "username",
	descrFields: ["descr"],
	minLength: 0,
	completeOnFocus: true,
	fallback: (id) => `#${id}`,
	isEmpty: (id) => id <= 0,
});
