<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import {
	CollectionListPage,
	FilterOperatorParam,
	type CollectionParams,
} from "@katren/vue-collection-lib";

import { productApi } from "@/api/product.gen";
import { productCollection } from "@/collections/product";

const route = useRoute();

const isProductGroupSelection = computed(() => {
	const value = route.query.product_group_select;
	return value === "1" || value === "true";
});

const withGroupFilter = (
	params: CollectionParams | undefined,
): CollectionParams => {
	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					is_group: {
						o: FilterOperatorParam.E,
						v: true,
					},
				},
			},
		],
	};
};

const productGroupApi = {
	...productApi,
	list: async (params?: CollectionParams) => {
		return await productApi.list(withGroupFilter(params));
	},
};

const productGroupCollection = {
	...productCollection,
	api: productGroupApi,
	hierarchy: {
		...productCollection.hierarchy,
		selectable: "groups" as const,
	},
	stateKey: "product-group-reference-grid",
};

const collection = computed(() => {
	return isProductGroupSelection.value
		? productGroupCollection
		: productCollection;
});
</script>

<template>
	<CollectionListPage :collection="collection" />
</template>
