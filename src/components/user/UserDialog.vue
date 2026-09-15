<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import Dialog from "primevue/dialog";

import { userApi } from "@/api/user";
import ObjectHistoryButton from "@/components/history/ObjectHistoryButton.vue";
import UserForm from "@/components/user/UserForm.vue";
import { useUserSchemas } from "@/composables/schemas/useUserSchemas";
import type { User, UserKey, UserNew, UserUpd } from "@/types/user";
import {
	useCollectionFormSubmit,
	useFormErrors,
} from "@katren/vue-collection-lib/composables/form";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";

type UserFormMode = "create" | "edit" | "copy";
type UserFormModel = Partial<User> & {
	pwd?: string;
};

const props = defineProps<{
	visible: boolean;
	mode: UserFormMode;
	userId?: number | null;
}>();

const emit = defineEmits<{
	"update:visible": [visible: boolean];
	saved: [];
}>();

const { t } = useI18n();
const userSchemas = useUserSchemas();
const formErrors = useFormErrors();

const loading = ref(false);
const loadError = ref("");
const model = ref<UserFormModel>({});
let loadSequence = 0;

const visibleModel = computed({
	get: (): boolean => props.visible,
	set: (value: boolean): void => {
		emit("update:visible", value);
	},
});

const key = computed<UserKey>(() => ({
	id: Number(props.userId ?? 0),
}));

const formSubmit = useCollectionFormSubmit<
	UserFormModel,
	UserKey,
	UserNew,
	UserUpd
>({
	api: userApi,
	mode: computed(() => props.mode),
	key,
	fields: ["name", "role_id", "max_user_id", "pwd"],
	createSchema: userSchemas.UserNewSchema,
	updateSchema: userSchemas.UserUpdSchema,
	errors: formErrors,
	onSuccess: async () => {
		emit("saved");
	},
});

const resetCreateModel = (): void => {
	model.value = {
		name: "",
		role_id: "admin",
		max_user_id: null,
		max_user: null,
		pwd: "",
	};
	formSubmit.setInitialModel(null);
};

const load = async (): Promise<void> => {
	const sequence = ++loadSequence;
	formErrors.clear();
	loadError.value = "";

	if (props.mode === "create") {
		resetCreateModel();
		return;
	}

	if (!props.userId || props.userId <= 0) {
		loadError.value = t("User.errors.invalidId");
		return;
	}

	loading.value = true;
	try {
		const detail = await userApi.detail({
			id: props.userId,
		});
		if (sequence !== loadSequence) {
			return;
		}

		if (props.mode === "copy") {
			model.value = {
				...detail,
				id: undefined,
				name: `${detail.name} - ${t("Grid.copySuffix")}`,
				max_user_id: null,
				max_user: null,
				pwd: "",
			};
			formSubmit.setInitialModel(null);
			return;
		}

		model.value = detail;
		formSubmit.setInitialModel(detail);
	} catch (error: unknown) {
		if (sequence === loadSequence) {
			loadError.value = errorText(error);
		}
	} finally {
		if (sequence === loadSequence) {
			loading.value = false;
		}
	}
};

const submit = async (formModel: UserNew | UserUpd): Promise<void> => {
	await formSubmit.submit(formModel as UserFormModel);
};

const cancel = (): void => {
	if (formSubmit.submitting.value) {
		return;
	}
	visibleModel.value = false;
};

watch(
	() => [props.visible, props.mode, props.userId] as const,
	async ([visible]) => {
		if (!visible) {
			loadSequence++;
			return;
		}
		await load();
	},
	{ immediate: true },
);
</script>

<template>
	<Dialog
		v-model:visible="visibleModel"
		:header="t(`User.form.${props.mode}`)"
		modal
		:closable="!formSubmit.submitting.value"
		:dismissableMask="!formSubmit.submitting.value"
		:style="{ width: '42rem', maxWidth: 'calc(100vw - 2rem)' }"
	>
		<div v-if="loading" class="py-6 text-center text-surface-500">
			{{ t("Grid.loading") }}
		</div>

		<div
			v-else-if="loadError"
			class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
		>
			{{ loadError }}
		</div>

		<template v-else>
			<div
				v-if="props.mode === 'edit'"
				class="mb-4 flex justify-end"
			>
				<ObjectHistoryButton
					object-type="users"
					:object-id="props.userId"
				/>
			</div>

			<UserForm
				:model="model"
				:mode="props.mode"
				:errors="formErrors"
				:submitting="formSubmit.submitting.value"
				@submit="submit"
				@cancel="cancel"
			/>
		</template>
	</Dialog>
</template>
