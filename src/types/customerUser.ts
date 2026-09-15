export interface CustomerUserDTO {
	customer_id: number;
	id: number;
	max_user_id: number;
	username: string;
	avatar_url: string | null;
	is_active: boolean;
}

export interface CustomerUser {
	customer_id: number;
	id: number;
	max_user_id: number;
	username: string;
	avatar_url: string | null;
	is_active: boolean;
}

export type CustomerUserKey = Pick<CustomerUser, "id">;
