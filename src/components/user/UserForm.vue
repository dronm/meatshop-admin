<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import Button from "primevue/button";
import InputText from "primevue/inputtext";

import MaxUserReferenceInput from "@/components/references/MaxUserReferenceInput.vue";
import RoleIdReferenceInput from "@/components/references/RoleIdReferenceInput.vue";
import type { FormErrorsView } from "@katren/vue-collection-lib/types/formErrors";
import type { RoleId } from "@/types/enums/roleId";
import type { User, UserNew, UserUpd } from "@/types/user";

type FormMode = "create" | "edit" | "copy";
type UserFormModel = Omit<Partial<User>, "role_id"> & {
	role_id?: RoleId | null;
	pwd?: string;
};

const props = withDefaults(defineProps<{
	model?: UserFormModel;
	mode?: FormMode;
	errors?: FormErrorsView;
	submitting?: boolean;
}>(), {
	model: () => ({}),
	mode: "create",
	errors: undefined,
	submitting: false,
});

const emit = defineEmits<{
	submit: [model: UserNew | UserUpd];
	cancel: [];
}>();

const { t } = useI18n();
const form = ref<UserFormModel>({
	name: "",
	role_id: "admin",
	max_user_id: null,
	max_user: null,
	pwd: "",
});

watch(
	() => props.model,
	(model) => {
		form.value = {
			name: "",
			role_id: "admin",
			max_user_id: null,
			max_user: null,
			pwd: "",
			...model,
		};
	},
	{ immediate: true, deep: true },
);

const fieldInvalid = (field: string): boolean => props.errors?.has(field) ?? false;
const fieldError = (field: string): string => props.errors?.first(field) ?? "";

const submit = (): void => {
	if (props.mode === "edit") {
		emit("submit", {
			name: form.value.name ?? "",
			role_id: form.value.role_id ?? "admin",
			max_user_id: form.value.max_user_id ?? null,
		} as UserUpd);
		return;
	}

	emit("submit", {
		name: form.value.name ?? "",
		role_id: form.value.role_id ?? "admin",
		pwd: form.value.pwd ?? "",
		max_user_id: form.value.max_user_id ?? null,
	} as UserNew);
};
</script>

<template>
	<form class="space-y-4" @submit.prevent="submit">
		<div
			v-if="props.errors?.formErrors.length"
			class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
		>
			<div v-for="message in props.errors.formErrors" :key="message">
				{{ message }}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label for="userName">{{ t("User.fields.name") }}</label>
				<InputText
					id="userName"
					v-model="form.name"
					:invalid="fieldInvalid('name')"
					autocomplete="username"
					required
				/>
				<small v-if="fieldInvalid('name')" class="text-red-600">
					{{ fieldError("name") }}
				</small>
			</div>

			<div class="flex flex-col gap-1">
				<label for="userRoleId">{{ t("User.fields.role_id") }}</label>
				<RoleIdReferenceInput
					id="userRoleId"
					v-model="form.role_id"
					:invalid="fieldInvalid('role_id')"
					:showClear="false"
				/>
				<small v-if="fieldInvalid('role_id')" class="text-red-600">
					{{ fieldError("role_id") }}
				</small>
			</div>

			<div class="flex flex-col gap-1 md:col-span-2">
				<label for="userMaxUserId">{{ t("User.fields.max_user_id") }}</label>
				<MaxUserReferenceInput
					id="userMaxUserId"
					v-model="form.max_user_id"
					:modelDescr="form.max_user?.descr ?? null"
					:modelDescrId="form.max_user?.keys.id ?? null"
					:invalid="fieldInvalid('max_user_id')"
					:error="fieldError('max_user_id')"
				/>
			</div>

			<div
				v-if="props.mode !== 'edit'"
				class="flex flex-col gap-1 md:col-span-2"
			>
				<label for="userPwd">{{ t("User.fields.pwd") }}</label>
				<InputText
					id="userPwd"
					v-model="form.pwd"
					type="password"
					autocomplete="new-password"
					:invalid="fieldInvalid('pwd')"
					required
				/>
				<small v-if="fieldInvalid('pwd')" class="text-red-600">
					{{ fieldError("pwd") }}
				</small>
			</div>
		</div>

		<div class="flex justify-end gap-2">
			<Button
				type="button"
				:label="t('Grid.commands.cancel')"
				severity="secondary"
				outlined
				:disabled="props.submitting"
				@click="emit('cancel')"
			/>
			<Button
				type="submit"
				:label="t('Grid.commands.save')"
				:loading="props.submitting"
				icon="pi pi-check"
			/>
		</div>
	</form>
</template>
