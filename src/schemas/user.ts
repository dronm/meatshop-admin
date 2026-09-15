import * as v from "valibot";

import { createCommonSchemas, defaultTranslate, type TranslateFn } from "@/schemas/common";
import { createRoleIdSchemas } from "@/schemas/enums/roleId";
import type { User, UserDTO } from "@/types/user";

export const createUserSchemas = (t: TranslateFn) => {
	const { IdSchema } = createCommonSchemas(t);
	const { RoleIdSchema } = createRoleIdSchemas(t);

	const UserIdSchema = IdSchema;
	const UserNameSchema = v.pipe(
		v.string(t("validation.required")),
		v.trim(),
		v.nonEmpty(t("validation.required")),
		v.maxLength(100, t("validation.maxLen", { maxLen: 100 })),
	);
	const UserPasswordSchema = v.pipe(
		v.string(t("validation.required")),
		v.nonEmpty(t("validation.required")),
		v.maxLength(50, t("validation.maxLen", { maxLen: 50 })),
	);
	const UserReferenceSchema = v.object({
		keys: v.object({
			id: IdSchema,
		}),
		descr: v.string(),
	});
	const UserDTOSchema = v.object({
		id: UserIdSchema,
		name: UserNameSchema,
		role_id: RoleIdSchema,
		max_user: v.nullable(UserReferenceSchema),
	});
	const UserSchema = v.object({
		id: UserIdSchema,
		name: UserNameSchema,
		role_id: RoleIdSchema,
		max_user_id: v.nullable(IdSchema),
		max_user: v.nullable(UserReferenceSchema),
	});
	const UserKeySchema = v.object({
		id: UserIdSchema,
	});
	const UserNewSchema = v.object({
		name: UserNameSchema,
		role_id: RoleIdSchema,
		pwd: UserPasswordSchema,
		max_user_id: v.nullable(IdSchema),
	});
	const UserUpdSchema = v.partial(v.object({
		name: UserNameSchema,
		role_id: RoleIdSchema,
		max_user_id: v.nullable(IdSchema),
	}));
	const UserUpdateSchema = v.object({
		key: UserKeySchema,
		model: UserUpdSchema,
	});
	const UserLoginRequestSchema = v.object({
		name: UserNameSchema,
		pwd: UserPasswordSchema,
	});

	return {
		UserIdSchema,
		UserNameSchema,
		UserPasswordSchema,
		UserDTOSchema,
		UserSchema,
		UserKeySchema,
		UserNewSchema,
		UserUpdSchema,
		UserUpdateSchema,
		UserLoginRequestSchema,
	};
};

const userSchemas = createUserSchemas(defaultTranslate);

export const UserIdSchema = userSchemas.UserIdSchema;
export const UserNameSchema = userSchemas.UserNameSchema;
export const UserPasswordSchema = userSchemas.UserPasswordSchema;
export const UserDTOSchema = userSchemas.UserDTOSchema;
export const UserSchema = userSchemas.UserSchema;
export const UserKeySchema = userSchemas.UserKeySchema;
export const UserNewSchema = userSchemas.UserNewSchema;
export const UserUpdSchema = userSchemas.UserUpdSchema;
export const UserUpdateSchema = userSchemas.UserUpdateSchema;
export const UserLoginRequestSchema = userSchemas.UserLoginRequestSchema;

export const userFromDTO = (
	dto: unknown,
): User => {
	const parsed = v.parse(UserDTOSchema, dto) as UserDTO;

	return {
		...parsed,
		max_user_id: parsed.max_user?.keys.id ?? null,
	};
};
