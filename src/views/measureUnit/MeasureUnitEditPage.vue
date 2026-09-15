<script setup lang="ts">
import { useI18n } from "vue-i18n";

import {
	CollectionEditPage,
	useCollectionEditPage,
} from "@katren/vue-collection-lib";
import { measureUnitApi } from "@/api/measureUnit.gen";
import MeasureUnitForm from "@/components/measureUnit/MeasureUnitForm.vue";
import { useMeasureUnitSchemas } from "@/composables/schemas/useMeasureUnitSchemas.gen";
import {
	createMeasureUnitFormModel,
	measureUnitFormMutationFields,
	type MeasureUnitFormModel,
} from "@/forms/measureUnit.gen";
import type {
	MeasureUnit,
	MeasureUnitKey,
	MeasureUnitNew,
	MeasureUnitUpd,
} from "@/types/measureUnit.gen";

const { t } = useI18n();
const schemas = useMeasureUnitSchemas();
const edit = useCollectionEditPage<
	MeasureUnitFormModel,
	MeasureUnitKey,
	MeasureUnitNew,
	MeasureUnitUpd,
	MeasureUnit
>({
	api: measureUnitApi,
	createRouteName: "measureUnitCreate",
	listRoute: { name: "measureUnits" },
	keyFromRoute: (route) => ({
		id: Number(route.params.id ?? 0),
	}),
	copyKeyFromRoute: (route) => route.query.copy_id
		? ({
			id: Number(route.query.copy_id ?? 0),
		})
		: null,
	createModel: createMeasureUnitFormModel,
	copyModel: (detail) => ({
		...detail,
		id: undefined,
		name: `${detail.name} - ${t("Grid.copySuffix")}`,
	}),
	fields: measureUnitFormMutationFields,
	createSchema: schemas.MeasureUnitNewSchema,
	updateSchema: schemas.MeasureUnitUpdSchema,
	success: { mode: "back" },
});

const submit = async (model: MeasureUnitNew): Promise<void> => {
	await edit.submit(model);
};
</script>

<template>
	<CollectionEditPage
		:title="t(`MeasureUnit.form.${edit.mode.value}`)"
		:loading="edit.loading.value"
		@back="edit.goBack"
	>
		<MeasureUnitForm
			:model="edit.model.value"
			:mode="edit.mode.value"
			:errors="edit.errors"
			:submitting="edit.submitting.value"
			@submit="submit"
			@cancel="edit.goBack"
		/>
	</CollectionEditPage>
</template>
