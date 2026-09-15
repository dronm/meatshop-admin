import type { RoleId } from "@/types/enums/roleId";

export interface UserReference {
	keys: {
		id: number;
	};
	descr: string;
}

export interface UserDTO {
	id: number;
	name: string;
	role_id: RoleId;
	max_user: UserReference | null;
}

export interface User {
	id: number;
	name: string;
	role_id: RoleId;
	max_user_id: number | null;
	max_user: UserReference | null;
}

export type UserKey = Pick<User, "id">;

export interface UserNew {
	name: string;
	role_id: RoleId;
	pwd: string;
	max_user_id: number | null;
}

export type UserUpd = Partial<Pick<
	User,
	"name" | "role_id" | "max_user_id"
>>;

export interface UserUpdate {
	key: UserKey;
	model: UserUpd;
}

export interface UserLoginRequest {
	name: string;
	pwd: string;
}
