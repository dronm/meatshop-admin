import { defineStore } from "pinia";
import { ref } from "vue";

import { type Auth } from "@/types/auth";
import { errorText } from "@katren/vue-collection-lib/utils/errorText";
import type { UserLogin, UserLoginResponse } from "@/types/userLogin";
import type { UserLoginRequest } from "@/types/user";
import { userApi } from "@/api/user";
import api from "@/api/http";
import type { UserProfileBase } from "@katren/vue-business-app/user";

export const useAuthStore = defineStore("auth", () => {
	let authStruct = null;
	let userStruct = null;

	// const tokenToHeader = (token: string) => {
	// 	srvConn.defaultHTTPHeaders['Authorization'] =
	// 		`Bearer ${token}`;
	// }

	const authStored = localStorage.getItem("auth");
	if (authStored) {
		authStruct = JSON.parse(authStored) as Auth;
	}

	const userStored = localStorage.getItem("user");
	if (userStored) {
		userStruct = JSON.parse(userStored) as UserLogin;
	}

	const auth = ref<Auth | null>(authStruct);
	const user = ref<UserLogin | null>(userStruct);
	// if(auth.value?.token) {
	// 	tokenToHeader(auth.value?.token);
	// }

	const isAuthenticated = (): boolean => {
		return !!auth.value?.token;
	};

	const syncApiAuthState = (): void => {
		api.isAuthed = isAuthenticated();
	};

	const login = async (cred: UserLoginRequest): Promise<void> => {
		try {
			const response: UserLoginResponse = await userApi.login(cred);
			setUserLogged(response);
		} catch (error: unknown) {
			// throw new Error(t("AuthStore.errLogin", {ERROR: }));
			const msg = errorText(error);
			throw new Error(msg);
		}
	};

	//call on 401 error code
	const setUserUnlogged = () => {
		auth.value = null;
		user.value = null;
		localStorage.removeItem("auth");
		localStorage.removeItem("user");
		syncApiAuthState();
		// delete srvConn.defaultHTTPHeaders['Authorization'];
	};

	const logout = async (): Promise<void> => {
		try {
			await userApi.logout();
		} finally {
			setUserUnlogged();
		}
	};

	const updateCurrentUserProfile = (profile: UserProfileBase): void => {
		if (user.value === null || user.value.id !== profile.id) {
			return;
		}

		user.value = {
			...user.value,
			name: profile.name,
		};
		localStorage.setItem("user", JSON.stringify(user.value));
	};

	//private function
	const setUserLogged = (srvResp: UserLoginResponse) => {
		auth.value = srvResp.auth;
		user.value = srvResp.user;

		localStorage.setItem("auth", JSON.stringify(srvResp.auth));
		localStorage.setItem("user", JSON.stringify(srvResp.user));
		syncApiAuthState();
		// tokenToHeader(auth.value?.token);
	};

	api.unlogUser = setUserUnlogged;
	syncApiAuthState();

	return {
		auth,
		user,
		isAuthenticated,
		login,
		logout,
		updateCurrentUserProfile,
		setUserUnlogged,
	};
});

