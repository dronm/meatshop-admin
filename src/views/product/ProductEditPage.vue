<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import {
	CollectionEditPage,
	useCollectionEditPage,
} from "@katren/vue-collection-lib";
import { productApi } from "@/api/product.gen";
import ProductForm from "@/components/product/ProductForm.vue";
import { useProductSchemas } from "@/composables/schemas/useProductSchemas.gen";
import {
	createProductFormModel,
	productFormMutationFields,
	type ProductFormModel,
} from "@/forms/product.gen";
import type {
	Product,
	ProductKey,
	ProductNew,
	ProductUpd,
} from "@/types/product.gen";

const { t } = useI18n();
const route = useRoute();
const schemas = useProductSchemas();

const createProductModel = (): ProductFormModel => {
	const model = createProductFormModel();
	const parentID = Number(route.query.parent_id ?? 0);

	if (Number.isInteger(parentID) && parentID > 0) {
		model.parent_id = parentID;
	}

	const isGroup = route.query.is_group;
	model.is_group = isGroup === "1" || isGroup === "true";

	return model;
};

const edit = useCollectionEditPage<
	ProductFormModel,
	ProductKey,
	ProductNew,
	ProductUpd,
	Product
>({
	api: productApi,
	createRouteName: "productCreate",
	listRoute: { name: "products" },
	keyFromRoute: (route) => ({
		id: Number(route.params.id ?? 0),
	}),
	copyKeyFromRoute: (route) => route.query.copy_id
		? ({
			id: Number(route.query.copy_id ?? 0),
		})
		: null,
	createModel: createProductModel,
	copyModel: (detail) => ({
		...detail,
		id: undefined,
		name: `${detail.name} - ${t("Grid.copySuffix")}`,
	}),
	fields: productFormMutationFields,
	createSchema: schemas.ProductNewSchema,
	updateSchema: schemas.ProductUpdSchema,
	success: { mode: "back" },
});

const submit = async (model: ProductNew): Promise<void> => {
	await edit.submit(model);
};
</script>

<template>
	<CollectionEditPage
		:title="t(`Product.form.${edit.mode.value}`)"
		:loading="edit.loading.value"
		@back="edit.goBack"
	>
		<ProductForm
			:model="edit.model.value"
			:mode="edit.mode.value"
			:errors="edit.errors"
			:submitting="edit.submitting.value"
			@submit="submit"
			@cancel="edit.goBack"
		/>
	</CollectionEditPage>
</template>
