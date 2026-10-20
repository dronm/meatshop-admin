import type {
	CollectionParams,
	CollectionResponse,
	GridColumn,
	GridCreateContext,
	GridHierarchyConfig,
} from "@katren/vue-collection-lib";

import { productApi } from "@/api/product.gen";
import { productCollection as generatedProductCollection } from "@/collections/product.gen";
import type { ProductList } from "@/types/productList.gen";
import { normalizeRef1C } from "@/utils/ref1c";

type ProductListRow = ProductList & {
	ref_1c_exists?: boolean;
};

const productListApi = {
	...productApi,
	list: async (
		params?: CollectionParams,
	): Promise<CollectionResponse<ProductListRow>> => {
		const collection = await productApi.list(params);

		return {
			...collection,
			rows: collection.rows.map((row) => ({
				...row,
				ref_1c_exists: normalizeRef1C(row.ref_1c) !== null,
			})),
		};
	},
};

const productHierarchy: GridHierarchyConfig<ProductListRow> = {
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

const productColumns: GridColumn<ProductListRow>[] = [
	...generatedProductCollection.columns.map((column) => {
		if (column.field !== "measure_unit") {
			return column;
		}

		return {
			...column,
			format: formatReference,
		};
	}),
	{
		field: "ref_1c_exists",
		headerKey: "Product.fields.ref_1c_exists",
		sortable: false,
		searchable: false,
		dataType: "boolean",
		align: "center",
		width: "5rem",
	},
];

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
	api: productListApi,
	columns: productColumns,
	hierarchy: productHierarchy,
	routes: {
		...generatedProductCollection.routes,
		create: createRoute,
	},
};
