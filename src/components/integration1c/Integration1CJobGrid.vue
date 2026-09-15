<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import {
	CollectionGrid,
	FilterOperatorParam,
	SortDirect,
	type CollectionGridApi,
	type CollectionParams,
	type GridColumn,
	type GridCommand,
} from "@katren/vue-collection-lib";

import { integration1CJobApi } from "@/api/integration1cJob";
import type {
	Integration1CJob,
	Integration1CJobKey,
} from "@/types/integration1cJob";

const props = defineProps<{
	correlationPrefix: string;
}>();

const { t } = useI18n();

const withCorrelationFilter = (
	params: CollectionParams | undefined,
): CollectionParams => {
	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					correlation_id: {
						o: FilterOperatorParam.LK,
						v: `${props.correlationPrefix}%`,
					},
				},
			},
		],
	};
};

const jobsApi: CollectionGridApi<
	Integration1CJob,
	Integration1CJobKey,
	never,
	Record<string, never>,
	Integration1CJob
> = {
	serviceName: integration1CJobApi.serviceName,
	list: async (params?: CollectionParams) => {
		return await integration1CJobApi.list(
			withCorrelationFilter(params),
		);
	},
};

const formatDate = (value: unknown): string => {
	return value instanceof Date
		? value.toLocaleString("ru-RU")
		: "";
};

const formatJSON = (value: unknown): string => {
	if (value === undefined) {
		return "";
	}

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
};

const formatStatus = (value: unknown): string => {
	if (typeof value !== "string") {
		return "";
	}

	const key = `Integration1CJob.status.${value}`;
	const translated = t(key);

	return translated === key ? value : translated;
};

const columns = computed<GridColumn<Integration1CJob>[]>(() => [
	{
		field: "id",
		headerKey: "Integration1CJob.fields.id",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "6rem",
	},
	{
		field: "command",
		headerKey: "Integration1CJob.fields.command",
		sortable: true,
		width: "14rem",
	},
	{
		field: "params",
		headerKey: "Integration1CJob.fields.params",
		sortable: false,
		format: formatJSON,
		width: "28rem",
	},
	{
		field: "status",
		headerKey: "Integration1CJob.fields.status",
		sortable: true,
		format: formatStatus,
		width: "10rem",
	},
	{
		field: "attempt_count",
		headerKey: "Integration1CJob.fields.attempt_count",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "8rem",
	},
	{
		field: "max_attempts",
		headerKey: "Integration1CJob.fields.max_attempts",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "8rem",
	},
	{
		field: "available_at",
		headerKey: "Integration1CJob.fields.available_at",
		sortable: true,
		dataType: "date",
		format: formatDate,
		width: "13rem",
	},
	{
		field: "created_at",
		headerKey: "Integration1CJob.fields.created_at",
		sortable: true,
		dataType: "date",
		format: formatDate,
		width: "13rem",
	},
	{
		field: "started_at",
		headerKey: "Integration1CJob.fields.started_at",
		sortable: true,
		dataType: "date",
		format: formatDate,
		width: "13rem",
	},
	{
		field: "completed_at",
		headerKey: "Integration1CJob.fields.completed_at",
		sortable: true,
		dataType: "date",
		format: formatDate,
		width: "13rem",
	},
	{
		field: "last_error",
		headerKey: "Integration1CJob.fields.last_error",
		sortable: false,
		width: "28rem",
	},
]);

const commands: GridCommand<
	Integration1CJob,
	Integration1CJobKey
>[] = [
	{ name: "search" },
	{ name: "refresh" },
];

const getKey = (
	row: Integration1CJob,
): Integration1CJobKey => ({
	id: row.id,
});
</script>

<template>
	<CollectionGrid
		:api="jobsApi"
		:columns="columns"
		:commands="commands"
		:getKey="getKey"
		:defaultSorter="[
			{
				f: 'created_at',
				d: SortDirect.DESC,
			},
		]"
		dataKey="id"
		commandsMode="replace"
		:showContextMenu="false"
		:pageSize="20"
	/>
</template>
