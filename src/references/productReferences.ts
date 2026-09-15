import {
	FilterOperatorParam,
	defineCrudReference,
	type CollectionParams,
} from "@katren/vue-collection-lib";

import { measureUnitApi } from "@/api/measureUnit.gen";
import { productApi } from "@/api/product.gen";
import type { MeasureUnit } from "@/types/measureUnit.gen";
import type { ProductList } from "@/types/productList.gen";

export type IDReferenceKey = {
	id: number;
};

type ProductReferenceRow = Pick<
	ProductList,
	"id" | "name" | "is_group"
>;

type ProductGroupReferenceRow = ProductReferenceRow;

const withProductFilter = (
	params: CollectionParams | undefined,
	isGroup: boolean,
): CollectionParams => {
	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					is_group: {
						o: FilterOperatorParam.E,
						v: isGroup,
					},
				},
			},
		],
	};
};

const withProductGroupFilter = (
	params: CollectionParams | undefined,
): CollectionParams => {
	return withProductFilter(params, true);
};

export const measureUnitReference = defineCrudReference<
	MeasureUnit,
	IDReferenceKey,
	number
>({
	list: measureUnitApi.list,
	detail: measureUnitApi.detail,
	keyField: "id",
	searchField: "name",
	descrFields: ["name"],
	minLength: 0,
	completeOnFocus: true,
	fallback: (id) => `#${id}`,
	isEmpty: (id) => id <= 0,
	emptyValue: 0,
	openRoute: (value) => ({
		name: "measureUnitEdit",
		params: value.keys ?? {},
	}),
	selectRoute: {
		name: "measureUnits",
	},
});

export const productReference = defineCrudReference<
	ProductReferenceRow,
	IDReferenceKey,
	number
>({
	list: async (params?: CollectionParams) => {
		return await productApi.list(withProductFilter(params, false));
	},
	detail: async (key) => {
		return await productApi.detail(key);
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
		name: "productEdit",
		params: value.keys ?? {},
	}),
	selectRoute: {
		name: "products",
	},
});

export const productGroupReference = defineCrudReference<
	ProductGroupReferenceRow,
	IDReferenceKey,
	number
>({
	list: async (params?: CollectionParams) => {
		return await productApi.list(withProductGroupFilter(params));
	},
	detail: async (key) => {
		return await productApi.detail(key);
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
		name: "productEdit",
		params: value.keys ?? {},
	}),
	selectRoute: () => ({
		name: "products",
		query: {
			product_group_select: "1",
		},
	}),
});
