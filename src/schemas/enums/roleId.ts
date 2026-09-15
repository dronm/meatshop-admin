import * as v from "valibot";

import { defaultTranslate, type TranslateFn } from "@/schemas/common";

export const createRoleIdSchemas = (t: TranslateFn) => {
	const RoleIdSchema = v.picklist(
		[
			"admin",
			"constr_manager",
			"accountant",
		],
		t("validation.required"),
	);

	return {
		RoleIdSchema,
	};
};

const roleIdSchemas = createRoleIdSchemas(defaultTranslate);

export const RoleIdSchema = roleIdSchemas.RoleIdSchema;
