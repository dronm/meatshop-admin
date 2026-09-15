<script setup lang="ts">
import {
	nextTick,
	ref,
	watch,
} from "vue";
import { useI18n } from "vue-i18n";
import {
	useRoute,
	useRouter,
} from "vue-router";

import { userApi } from "@/api/user";
import UserDialog from "@/components/user/UserDialog.vue";
import type {
	User,
	UserKey,
} from "@/types/user";
import CollectionGrid from "@katren/vue-collection-lib/components/crudGrid/CollectionGrid.vue";
import type {
	CollectionGridExpose,
	GridColumn,
} from "@katren/vue-collection-lib/components/crudGrid/types";

type UserFormMode = "create" | "edit" | "copy";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const gridRef = ref<CollectionGridExpose | null>(null);
const dialogVisible = ref(false);
const dialogMode = ref<UserFormMode>("create");
const dialogUserId = ref<number | null>(null);

const columns: GridColumn<User>[] = [
	{
		field: "id",
		headerKey: "User.fields.id",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "8rem",
	},
	{
		field: "name",
		headerKey: "User.fields.name",
		sortable: true,
		width: "18rem",
	},
	{
		field: "role_id",
		headerKey: "User.fields.role_id",
		sortable: true,
		width: "12rem",
		format: (value) => t(`RoleId.${String(value)}`),
	},
];

const getKey = (row: User): UserKey => ({
	id: Number(row.id ?? 0),
});

const openCreate = async (): Promise<void> => {
	await router.push({
		name: "userCreate",
	});
};

const openEdit = async (row: User): Promise<void> => {
	await router.push({
		name: "userEdit",
		params: {
			id: String(row.id),
		},
	});
};

const openCopy = async (row: User): Promise<void> => {
	await router.push({
		name: "userCreate",
		query: {
			copy_id: String(row.id),
		},
	});
};

const syncDialogFromRoute = (): void => {
	if (route.name === "userEdit") {
		dialogMode.value = "edit";
		dialogUserId.value = Number(route.params.id ?? 0);
		dialogVisible.value = true;
		return;
	}

	if (route.name === "userCreate") {
		const copyId = Number(route.query.copy_id ?? 0);
		dialogMode.value = copyId > 0 ? "copy" : "create";
		dialogUserId.value = copyId > 0 ? copyId : null;
		dialogVisible.value = true;
		return;
	}

	dialogVisible.value = false;
	dialogUserId.value = null;
};

const closeDialog = async (): Promise<void> => {
	dialogVisible.value = false;
	if (route.name !== "users") {
		await router.push({
			name: "users",
		});
	}
	await nextTick();
	await gridRef.value?.focus();
};

const handleDialogVisible = async (visible: boolean): Promise<void> => {
	dialogVisible.value = visible;
	if (!visible) {
		await closeDialog();
	}
};

const handleSaved = async (): Promise<void> => {
	await gridRef.value?.load();
	await closeDialog();
};

watch(
	() => [route.name, route.params.id, route.query.copy_id] as const,
	syncDialogFromRoute,
	{ immediate: true },
);
</script>

<template>
	<section class="py-4">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<h3 class="text-2xl font-semibold">
				{{ t("User.title") }}
			</h3>
		</div>

		<CollectionGrid
			ref="gridRef"
			:api="userApi"
			:columns="columns"
			dataKey="id"
			:getKey="getKey"
			editMode="modal"
			stateKey="user-grid"
			:pageSize="30"
			:showCommandShortcuts="false"
			@create="openCreate"
			@edit="openEdit"
			@copy="openCopy"
		/>

		<UserDialog
			:visible="dialogVisible"
			:mode="dialogMode"
			:userId="dialogUserId"
			@update:visible="handleDialogVisible"
			@saved="handleSaved"
		/>
	</section>
</template>
