import type { Auth } from "./auth";
import type { RoleId } from "./enums/roleId";

export interface UserLoginResponse {
	user: UserLogin;
	auth: Auth;
}

export interface UserLogin {
	id: number;
	name: string;
	role_id: RoleId;
	create_dt: string;
	pub_key: string;
}
