import * as v from "valibot";

import {
	createCommonSchemas,
	defaultTranslate,
	type TranslateFn,
} from "@/schemas/common";
import type { CustomerUser } from "@/types/customerUser";

export const createCustomerUserSchemas = (t: TranslateFn) => {
	const {
		IdSchema,
		TextSchema,
	} = createCommonSchemas(t);

	const CustomerUserDTOSchema = v.object({
		customer_id: IdSchema,
		id: IdSchema,
		max_user_id: IdSchema,
		username: TextSchema,
		avatar_url: v.nullable(TextSchema),
		is_active: v.boolean(),
	});

	const CustomerUserSchema = v.object({
		customer_id: IdSchema,
		id: IdSchema,
		max_user_id: IdSchema,
		username: TextSchema,
		avatar_url: v.nullable(TextSchema),
		is_active: v.boolean(),
	});

	return {
		CustomerUserDTOSchema,
		CustomerUserSchema,
	};
};

const customerUserSchemas = createCustomerUserSchemas(defaultTranslate);

export const CustomerUserDTOSchema = customerUserSchemas.CustomerUserDTOSchema;
export const CustomerUserSchema = customerUserSchemas.CustomerUserSchema;

export const customerUserFromDTO = (dto: unknown): CustomerUser => {
	const parsedDTO = v.parse(CustomerUserDTOSchema, dto);

	return v.parse(CustomerUserSchema, {
		...parsedDTO,
	});
};
