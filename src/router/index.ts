import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/useAuthStore";
import { applicationRouteRecords } from "@/router/routeManifest";

const router = createRouter({
	history: createWebHistory(import.meta.env.VITE_BASE_URL || "/"),
	routes: [
		...applicationRouteRecords,
		{
			path: "/:pathMatch(.*)*",
			redirect: { name: "main" },
		},
	],
});

router.beforeEach((to) => {
	const authStore = useAuthStore();
	const routeName = typeof to.name === "string" ? to.name : "";

	if (!authStore.isAuthenticated() && routeName !== "main") {
		return { name: "main" };
	}

	const requiredRoleId = typeof to.meta.roleId === "string"
		? to.meta.roleId
		: null;
	if (requiredRoleId && authStore.user?.role_id !== requiredRoleId) {
		return { name: "main" };
	}

	return true;
});

export default router;
