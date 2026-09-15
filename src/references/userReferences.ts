import { defineCrudReference } from "@katren/vue-collection-lib";

import { userApi } from "@/api/user";
import type { User } from "@/types/user";

export type UserReferenceKey = {
	id: number;
};

export const userReference = defineCrudReference<
	User,
	UserReferenceKey,
	number
>({
	list: userApi.list,
	detail: userApi.detail,
	keyField: "id",
	searchField: "name",
	descrFields: ["name"],
	minLength: 0,
	completeOnFocus: true,
	fallback: (id) => `#${id}`,
	isEmpty: (id) => id <= 0,
	emptyValue: 0,
	openRoute: (value) => ({
		name: "userEdit",
		params: value.keys ?? {},
	}),
	selectRoute: {
		name: "users",
	},
});
