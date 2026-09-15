import {
	FilterOperatorParam,
	defineCrudReference,
	type CollectionParams,
} from "@katren/vue-collection-lib";

import { customerApi } from "@/api/customer.gen";
import { customerSalePlaceApi } from "@/api/customerSalePlace.gen";
import { customerUserApi } from "@/api/customerUser";
import type { CustomerList } from "@/types/customerList.gen";
import type { CustomerSalePlaceList } from "@/types/customerSalePlaceList.gen";
import type { CustomerUser } from "@/types/customerUser";

export type IDReferenceKey = {
	id: number;
};

type CustomerReferenceRow = Pick<
	CustomerList,
	"id" | "name" | "inn"
>;

const withCustomerFilter = (
	params: CollectionParams | undefined,
	customerId: number | null,
): CollectionParams => {
	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					customer_id: {
						o: FilterOperatorParam.E,
						v: customerId ?? 0,
					},
				},
			},
		],
	};
};

const withIDFilter = (
	params: CollectionParams | undefined,
	id: number,
): CollectionParams => {
	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					id: {
						o: FilterOperatorParam.E,
						v: id,
					},
				},
			},
		],
	};
};

export const customerReference = defineCrudReference<
	CustomerReferenceRow,
	IDReferenceKey,
	number
>({
	list: customerApi.list,
	detail: async (key) => {
		const response = await customerApi.list(
			withIDFilter(undefined, key.id),
		);
		const row = response.rows[0];

		if (row === undefined) {
			throw new Error(`Customer ${key.id} not found`);
		}

		return row;
	},
	keyField: "id",
	searchField: "name",
	descrFields: ["name"],
	minLength: 0,
	completeOnFocus: true,
	fallback: (id) => `#${id}`,
	isEmpty: (id) => id <= 0,
	emptyValue: 0,
	openRoute: (value) => ({
		name: "customerEdit",
		params: value.keys ?? {},
	}),
	selectRoute: {
		name: "customers",
	},
});

export const createCustomerSalePlaceReference = (
	customerId: number | null,
) => {
	return defineCrudReference<
		CustomerSalePlaceList,
		IDReferenceKey,
		number
	>({
		list: async (params?: CollectionParams) => {
			return await customerSalePlaceApi.list(
				withCustomerFilter(params, customerId),
			);
		},
		detail: async (key) => {
			return await customerSalePlaceApi.detail(key);
		},
		keyField: "id",
		searchField: "name",
		descrFields: ["name"],
		minLength: 0,
		completeOnFocus: true,
		fallback: (id) => `#${id}`,
		isEmpty: (id) => id <= 0,
		emptyValue: 0,
	});
};

export const createCustomerUserReference = (
	customerId: number | null,
) => {
	return defineCrudReference<
		CustomerUser,
		IDReferenceKey,
		number
	>({
		list: async (params?: CollectionParams) => {
			return await customerUserApi.list(
				withCustomerFilter(params, customerId),
			);
		},
		detail: async (key) => {
			const response = await customerUserApi.list(
				withIDFilter(undefined, key.id),
			);
			const row = response.rows[0];

			if (row === undefined) {
				throw new Error(`Customer user ${key.id} not found`);
			}

			return row;
		},
		keyField: "id",
		searchField: "username",
		descrFields: ["username"],
		minLength: 0,
		completeOnFocus: true,
		fallback: (id) => `#${id}`,
		isEmpty: (id) => id <= 0,
		emptyValue: 0,
	});
};
