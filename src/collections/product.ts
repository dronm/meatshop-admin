import type {
	GridCreateContext,
	GridHierarchyConfig,
} from "@katren/vue-collection-lib";

import { productCollection as generatedProductCollection } from "@/collections/product.gen";
import type { ProductList } from "@/types/productList.gen";

const productHierarchy: GridHierarchyConfig<ProductList> = {
	parentField: "parent_id",
	groupField: "is_group",
	idField: "id",
	labelField: "name",
	defaultViewMode: "hierarchy",
	allowFlatView: true,
	groupsFirst: true,
	rootLabelKey: "Product.hierarchy.root",
	createItemLabelKey: "Product.hierarchy.createItem",
	createGroupLabelKey: "Product.hierarchy.createGroup",
};

const formatReference = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return "";
	}

	const descr = (value as { descr?: unknown }).descr;
	return typeof descr === "string" ? descr : "";
};

const productColumns = generatedProductCollection.columns.map((column) => {
	if (column.field !== "measure_unit") {
		return column;
	}

	return {
		...column,
		format: formatReference,
	};
});

const createRoute = (context: GridCreateContext) => {
	const parentID = context.initialValues?.parent_id;
	const isGroup = context.initialValues?.is_group === true;

	return {
		name: "productCreate",
		query: {
			...(typeof parentID === "number" && parentID > 0
				? { parent_id: String(parentID) }
				: {}),
			...(isGroup ? { is_group: "1" } : {}),
		},
	};
};

export const productCollection = {
	...generatedProductCollection,
	columns: productColumns,
	hierarchy: productHierarchy,
	routes: {
		...generatedProductCollection.routes,
		create: createRoute,
	},
};
