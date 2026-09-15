<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

import { HorizontalMainMenu, useMainMenu } from "@katren/vue-business-app/menu";
import { ProgAboutDialog } from "@katren/vue-business-app/prog-about";
import { useReferenceSelectionMode } from "@katren/vue-collection-lib";
import CollectionDirtyGuard from "@katren/vue-collection-lib/components/form/CollectionDirtyGuard.vue";

import wsManager from "@/api/wsConn";
import { useAuthStore } from "@/stores/useAuthStore";
import Login from "@/views/Login.vue";

const {
	menu,
	error: menuError,
	load: fetchMenu,
} = useMainMenu({
	autoLoad: false,
});

const progAboutVisible = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const referenceSelectionMode = useReferenceSelectionMode();
const { user } = storeToRefs(authStore);

const authed = computed(() => authStore.isAuthenticated());
const userName = computed(() => user.value?.name ?? null);
const userRoleId = computed(() => user.value?.role_id ?? null);
const canManageMenu = computed(() => userRoleId.value === "admin");
const canViewApplicationRoutes = computed(() => userRoleId.value === "admin");
const collectionDirtyGuardEnabled = computed(() => {
	return (
		typeof route.name === "string" &&
		/(Create|Edit)$/.test(route.name)
	);
});

const openUserProfile = async (): Promise<void> => {
	await router.push({
		name: "userProfile",
	});
};

const showProgAbout = (): void => {
	progAboutVisible.value = true;
};

const openMainMenuConstructor = async (): Promise<void> => {
	await router.push({
		name: "mainMenuConstructor",
	});
};

const openApplicationRoutes = async (): Promise<void> => {
	await router.push({
		name: "applicationRoutes",
	});
};

const handleLogout = async (): Promise<void> => {
	try {
		await authStore.logout();
	} finally {
		menu.value = [];
		await router.push({ name: "main" });
	}
};

watch(
	() => [authed.value, user.value?.id] as const,
	async ([isAuthed]) => {
		if (isAuthed) {
			wsManager.connect();
			await fetchMenu();
			return;
		}

		wsManager.disconnect();
		menu.value = [];
		menuError.value = null;
	},
	{ immediate: true },
);
</script>

<template>
	<Login v-if="!authed" />

	<div
		v-else
		class="skstruktura-shell relative min-h-screen overflow-x-clip bg-slate-100 text-slate-900"
	>
		<div
			v-if="!referenceSelectionMode"
			class="pointer-events-none fixed inset-0 overflow-hidden"
			aria-hidden="true"
		>
			<div
				class="absolute -right-32 top-12 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl"
			/>
			<div
				class="absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-blue-300/10 blur-3xl"
			/>
			<div
				class="absolute inset-x-0 top-16 h-44 bg-gradient-to-b from-slate-200/55 to-transparent"
			/>
		</div>

		<HorizontalMainMenu
			v-if="!referenceSelectionMode"
			:menu="menu"
			:user-name="userName"
			:menu-error="menuError"
			:brand-route="{ name: 'main' }"
			:can-view-profile="true"
			:can-manage-menu="canManageMenu"
			:can-view-application-routes="canViewApplicationRoutes"
			@profile="openUserProfile"
			@about="showProgAbout"
			@constructor="openMainMenuConstructor"
			@all-routes="openApplicationRoutes"
			@logout="handleLogout"
		></HorizontalMainMenu>

		<ProgAboutDialog v-model:visible="progAboutVisible" />

		<main
			class="relative"
			:class="
				referenceSelectionMode
					? 'min-h-screen'
					: 'min-h-[calc(100vh-4rem)] pb-8'
			"
		>
			<div
				class="relative mx-auto w-full max-w-[1700px]"
				:class="
					referenceSelectionMode
						? 'p-0'
						: 'px-2 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4'
				"
			>
				<CollectionDirtyGuard
					:enabled="collectionDirtyGuardEnabled"
				>
					<router-view />
				</CollectionDirtyGuard>
			</div>
		</main>
	</div>
</template>
