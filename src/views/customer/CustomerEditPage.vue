<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";

import {
	CollectionEditPage,
	CollectionGrid,
	FilterOperatorParam,
	SortDirect,
	useCollectionEditPage,
	type CollectionGridApi,
	type CollectionParams,
	type GridColumn,
	type GridCommand,
} from "@katren/vue-collection-lib";
import { customerApi } from "@/api/customer.gen";
import { customerSalePlaceApi } from "@/api/customerSalePlace.gen";
import { customerUserApi } from "@/api/customerUser";
import { maxUserApi } from "@/api/maxUser.gen";
import CustomerForm from "@/components/customer/CustomerForm.vue";
import CounterpartyRef1cReferenceInput from "@/components/references/CounterpartyRef1cReferenceInput.vue";
import { useCustomerSchemas } from "@/composables/schemas/useCustomerSchemas.gen";
import {
	createCustomerFormModel,
	customerFormMutationFields,
	type CustomerFormModel,
} from "@/forms/customer.gen";
import type {
	Customer,
	CustomerKey,
	CustomerNew,
	CustomerUpd,
} from "@/types/customer.gen";
import type {
	CustomerSalePlace,
	CustomerSalePlaceKey,
	CustomerSalePlaceNew,
	CustomerSalePlaceUpd,
} from "@/types/customerSalePlace.gen";
import type { CustomerSalePlaceList } from "@/types/customerSalePlaceList.gen";
import type {
	CustomerUser,
	CustomerUserKey,
} from "@/types/customerUser";
import {
	normalizeRef1C,
	ref1CDescription,
} from "@/utils/ref1c";

const { t } = useI18n();
const schemas = useCustomerSchemas();
const edit = useCollectionEditPage<
	CustomerFormModel,
	CustomerKey,
	CustomerNew,
	CustomerUpd,
	Customer
>({
	api: customerApi,
	createRouteName: "customerCreate",
	listRoute: { name: "customers" },
	keyFromRoute: (route) => ({
		id: Number(route.params.id ?? 0),
	}),
	copyKeyFromRoute: (route) => route.query.copy_id
		? ({
			id: Number(route.query.copy_id ?? 0),
		})
		: null,
	createModel: createCustomerFormModel,
	copyModel: (detail) => ({
		...detail,
		id: undefined,
		name: `${detail.name} - ${t("Grid.copySuffix")}`,
	}),
	fields: customerFormMutationFields,
	createSchema: schemas.CustomerNewSchema,
	updateSchema: schemas.CustomerUpdSchema,
	success: { mode: "back" },
});

const customerId = computed<number | null>(() => {
	const id = edit.model.value.id;
	return typeof id === "number" && id > 0 ? id : null;
});

const submit = async (model: CustomerNew): Promise<void> => {
	await edit.submit(model);
};

const customerFilter = (
	params: CollectionParams | undefined,
): CollectionParams => {
	if (customerId.value === null) {
		return {
			...params,
			filter: [
				...(params?.filter ?? []),
				{
					f: {
						customer_id: {
							o: FilterOperatorParam.E,
							v: 0,
						},
					},
				},
			],
		};
	}

	return {
		...params,
		filter: [
			...(params?.filter ?? []),
			{
				f: {
					customer_id: {
						o: FilterOperatorParam.E,
						v: customerId.value,
					},
				},
			},
		],
	};
};

const salePlaceApi: CollectionGridApi<
	CustomerSalePlaceList,
	CustomerSalePlaceKey,
	CustomerSalePlaceNew,
	CustomerSalePlaceUpd,
	CustomerSalePlace
> = {
	serviceName: customerSalePlaceApi.serviceName,
	list: async (params?: CollectionParams) => {
		return await customerSalePlaceApi.list(customerFilter(params));
	},
	detail: customerSalePlaceApi.detail,
	create: customerSalePlaceApi.create,
	update: customerSalePlaceApi.update,
	delete: customerSalePlaceApi.delete,
};

const salePlaceColumns: GridColumn<CustomerSalePlaceList>[] = [
	{
		field: "name",
		headerKey: "CustomerSalePlace.fields.name",
		sortable: true,
		editable: true,
		width: "24rem",
	},
	{
		field: "address",
		headerKey: "CustomerSalePlace.fields.address",
		sortable: true,
		editable: true,
		width: "40rem",
	},
	{
		field: "kpp",
		headerKey: "CustomerSalePlace.fields.kpp",
		sortable: true,
		editable: true,
		width: "10rem",
	},
	{
		field: "ref_1c",
		headerKey: "CustomerSalePlace.fields.ref_1c",
		searchable: false,
		editable: true,
		width: "28rem",
	},
];

const salePlaceCommands: GridCommand<
	CustomerSalePlaceList,
	CustomerSalePlaceKey
>[] = [
	{ name: "create" },
	{ name: "edit" },
	{ name: "delete" },
	{ name: "search" },
	{ name: "refresh" },
];

const createSalePlaceRow = (): CustomerSalePlaceList => ({
	id: 0,
	customer_id: customerId.value ?? 0,
	name: "",
	address: "",
	kpp: null,
	ref_1c: null,
	is_active: true,
});

const createSalePlaceModel = (
	row: CustomerSalePlaceList,
): CustomerSalePlaceNew => ({
	customer_id: customerId.value ?? 0,
	name: row.name.trim(),
	address: row.address?.trim() || null,
	kpp: row.kpp?.trim() || null,
	ref_1c: normalizeRef1C(row.ref_1c),
	is_active: true,
});

const getSalePlaceKey = (
	row: CustomerSalePlaceList,
): CustomerSalePlaceKey => ({
	id: row.id,
});

const customerUsersApi: CollectionGridApi<
	CustomerUser,
	CustomerUserKey,
	never,
	Record<string, never>,
	CustomerUser
> = {
	serviceName: customerUserApi.serviceName,
	list: async (params?: CollectionParams) => {
		return await customerUserApi.list(customerFilter(params));
	},
};

const customerUserColumns: GridColumn<CustomerUser>[] = [
	{
		field: "avatar_url",
		headerKey: "CustomerUser.fields.avatar_url",
		searchable: false,
		width: "5rem",
		align: "center",
	},
	{
		field: "max_user_id",
		headerKey: "CustomerUser.fields.max_user_id",
		sortable: true,
		dataType: "number",
		align: "right",
		width: "14rem",
	},
	{
		field: "username",
		headerKey: "CustomerUser.fields.username",
		sortable: true,
		width: "32rem",
	},
	{
		field: "is_active",
		headerKey: "CustomerUser.fields.is_active",
		sortable: true,
		dataType: "boolean",
		width: "9rem",
		align: "center",
	},
];

const customerUserCommands: GridCommand<CustomerUser, CustomerUserKey>[] = [
	{ name: "search" },
	{ name: "refresh" },
];

const getCustomerUserKey = (row: CustomerUser): CustomerUserKey => ({
	id: row.id,
});

const updatingUserIds = ref<number[]>([]);
const userUpdateError = ref("");

const isUserUpdating = (id: number): boolean => {
	return updatingUserIds.value.includes(id);
};

const setUserUpdating = (id: number, updating: boolean): void => {
	if (updating) {
		if (!updatingUserIds.value.includes(id)) {
			updatingUserIds.value = [...updatingUserIds.value, id];
		}
		return;
	}

	updatingUserIds.value = updatingUserIds.value.filter(
		(item) => item !== id,
	);
};

const updateCustomerUserActive = async (
	row: CustomerUser,
	value: boolean,
): Promise<void> => {
	if (isUserUpdating(row.id) || row.is_active === value) {
		return;
	}

	const previousValue = row.is_active;
	userUpdateError.value = "";
	row.is_active = value;
	setUserUpdating(row.id, true);

	try {
		await maxUserApi.update(
			{ id: row.id },
			{ is_active: value },
		);
	} catch (error: unknown) {
		row.is_active = previousValue;
		userUpdateError.value = error instanceof Error
			? error.message
			: String(error);
	} finally {
		setUserUpdating(row.id, false);
	}
};

const onCustomerUserActiveUpdate = (
	row: CustomerUser,
	value: unknown,
): void => {
	void updateCustomerUserActive(row, value === true);
};
</script>

<template>
	<CollectionEditPage
		:title="t(`Customer.form.${edit.mode.value}`)"
		:loading="edit.loading.value"
		@back="edit.goBack"
	>
		<Tabs value="common">
			<TabList>
				<Tab value="common">
					{{ t("Customer.tabs.common") }}
				</Tab>
				<Tab value="sale-points">
					{{ t("Customer.tabs.salePoints") }}
				</Tab>
				<Tab value="users">
					{{ t("Customer.tabs.users") }}
				</Tab>
			</TabList>

			<TabPanels>
				<TabPanel value="common">
					<CustomerForm
						:model="edit.model.value"
						:mode="edit.mode.value"
						:errors="edit.errors"
						:submitting="edit.submitting.value"
						@submit="submit"
						@cancel="edit.goBack"
					/>
				</TabPanel>

				<TabPanel value="sale-points">
					<div
						v-if="customerId === null"
						class="customer-detail-placeholder"
					>
						{{ t("Customer.details.saveFirst") }}
					</div>
					<CollectionGrid
						v-else
						:key="`customer-sale-points-${customerId}`"
						:api="salePlaceApi"
						:columns="salePlaceColumns"
						:commands="salePlaceCommands"
						:getKey="getSalePlaceKey"
						:createRow="createSalePlaceRow"
						:createModel="createSalePlaceModel"
						:defaultSorter="[
							{
								f: 'name',
								d: SortDirect.ASC,
							},
						]"
						dataKey="id"
						editMode="inline"
						commandsMode="replace"
						:pageSize="20"
					>
						<template #editor-name="{ data }">
							<InputText
								v-model="data.name"
								class="w-full"
								required
							/>
						</template>
						<template #editor-address="{ data }">
							<InputText
								v-model="data.address"
								class="w-full"
							/>
						</template>
						<template #editor-kpp="{ data }">
							<InputText
								v-model="data.kpp"
								class="w-full"
								maxlength="10"
							/>
						</template>
						<template #body-ref_1c="{ value }">
							{{ ref1CDescription(value) }}
						</template>
						<template #editor-ref_1c="{ data }">
							<CounterpartyRef1cReferenceInput
								:id="`customerSalePlaceRef1C-${data.id}`"
								v-model="data.ref_1c"
							/>
						</template>
					</CollectionGrid>
				</TabPanel>

				<TabPanel value="users">
					<div
						v-if="customerId === null"
						class="customer-detail-placeholder"
					>
						{{ t("Customer.details.saveFirst") }}
					</div>
					<div v-else>
						<div
							v-if="userUpdateError"
							class="customer-user-error"
						>
							{{ userUpdateError }}
						</div>
						<CollectionGrid
							:key="`customer-users-${customerId}`"
							:api="customerUsersApi"
							:columns="customerUserColumns"
							:commands="customerUserCommands"
							:getKey="getCustomerUserKey"
							:defaultSorter="[
								{
									f: 'username',
									d: SortDirect.ASC,
								},
							]"
							dataKey="id"
							commandsMode="replace"
							:showContextMenu="false"
							eventService="MaxUser"
							:pageSize="20"
						>
							<template #body-avatar_url="{ value }">
								<img
									v-if="value"
									:src="String(value)"
									:alt="t('CustomerUser.fields.avatar_url')"
									class="customer-user-avatar"
								/>
							</template>
							<template #body-is_active="{ data }">
								<Checkbox
									:modelValue="data.is_active"
									:disabled="isUserUpdating(data.id)"
									binary
									@click.stop
									@update:modelValue="onCustomerUserActiveUpdate(data, $event)"
								/>
							</template>
						</CollectionGrid>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>
	</CollectionEditPage>
</template>

<style scoped>
.customer-detail-placeholder {
	border: 1px dashed var(--p-surface-300, #d1d5db);
	border-radius: 0.5rem;
	color: var(--p-text-muted-color, #6b7280);
	padding: 1rem;
}

.customer-user-avatar {
	border-radius: 50%;
	display: inline-block;
	height: 2rem;
	object-fit: cover;
	vertical-align: middle;
	width: 2rem;
}

.customer-user-error {
	background: var(--p-red-50, #fef2f2);
	border: 1px solid var(--p-red-200, #fecaca);
	border-radius: 0.375rem;
	color: var(--p-red-700, #b91c1c);
	font-size: 0.875rem;
	margin-bottom: 0.75rem;
	padding: 0.5rem 0.75rem;
}
</style>
