import { createCrudApi } from "@/api/createCrudApi";
import api from "@/api/http";
import { userFromDTO } from "@/schemas/user";
import type {
	User,
	UserDTO,
	UserKey,
	UserLoginRequest,
	UserNew,
	UserUpd,
} from "@/types/user";
import type { UserLoginResponse } from "@/types/userLogin";

const basePath = "/users";

const routes = {
	login: `${basePath}/login`,
	logout: `${basePath}/logout`,
};

const userCrudApi = createCrudApi<
	User,
	UserDTO,
	User,
	UserDTO,
	UserKey,
	UserNew,
	UserUpd
>({
	basePath,
	serviceName: "User",
	getKeyValue: (key: UserKey): number => key.id,
	fromListDTO: userFromDTO,
	fromDetailDTO: userFromDTO,
});

export const userApi = {
	...userCrudApi,

	login: async (
		req: UserLoginRequest,
	): Promise<UserLoginResponse> => {
		return await api.post<UserLoginResponse>(
			routes.login,
			req,
		);
	},

	logout: async (): Promise<void> => {
		return await api.post<void>(
			routes.logout,
		);
	},
};
