import * as v from "valibot";

import {
	createCommonSchemas,
	defaultTranslate,
	type TranslateFn,
} from "@/schemas/common";
import type { Integration1CJob } from "@/types/integration1cJob";

export const createIntegration1CJobSchemas = (t: TranslateFn) => {
	const {
		DateStringSchema,
		IdSchema,
		IntSchema,
		AttrsSchema,
		TextSchema,
	} = createCommonSchemas(t);

	const NullableDateStringSchema = v.nullable(DateStringSchema);
	const NullableTextSchema = v.nullable(TextSchema);

	const Integration1CJobDTOSchema = v.object({
		id: IdSchema,
		command: TextSchema,
		params: v.unknown(),
		correlation_id: NullableTextSchema,
		metadata: AttrsSchema,
		status: v.picklist(["queued", "processing", "completed"]),
		priority: IntSchema,
		available_at: DateStringSchema,
		attempt_count: IntSchema,
		max_attempts: IntSchema,
		locked_at: NullableDateStringSchema,
		locked_by: NullableTextSchema,
		last_error: NullableTextSchema,
		created_at: DateStringSchema,
		updated_at: DateStringSchema,
		started_at: NullableDateStringSchema,
		completed_at: NullableDateStringSchema,
	});

	const Integration1CJobSchema = v.object({
		id: IdSchema,
		command: TextSchema,
		params: v.unknown(),
		correlation_id: NullableTextSchema,
		metadata: AttrsSchema,
		status: v.picklist(["queued", "processing", "completed"]),
		priority: IntSchema,
		available_at: v.date(),
		attempt_count: IntSchema,
		max_attempts: IntSchema,
		locked_at: v.nullable(v.date()),
		locked_by: NullableTextSchema,
		last_error: NullableTextSchema,
		created_at: v.date(),
		updated_at: v.date(),
		started_at: v.nullable(v.date()),
		completed_at: v.nullable(v.date()),
	});

	return {
		Integration1CJobDTOSchema,
		Integration1CJobSchema,
	};
};

const integration1CJobSchemas = createIntegration1CJobSchemas(defaultTranslate);

export const Integration1CJobDTOSchema =
	integration1CJobSchemas.Integration1CJobDTOSchema;
export const Integration1CJobSchema =
	integration1CJobSchemas.Integration1CJobSchema;

const nullableDateFromDTO = (value: string | null): Date | null => {
	return value === null ? null : new Date(value);
};

export const integration1CJobFromDTO = (
	dto: unknown,
): Integration1CJob => {
	const parsedDTO = v.parse(Integration1CJobDTOSchema, dto);

	return v.parse(Integration1CJobSchema, {
		...parsedDTO,
		available_at: new Date(parsedDTO.available_at),
		locked_at: nullableDateFromDTO(parsedDTO.locked_at),
		created_at: new Date(parsedDTO.created_at),
		updated_at: new Date(parsedDTO.updated_at),
		started_at: nullableDateFromDTO(parsedDTO.started_at),
		completed_at: nullableDateFromDTO(parsedDTO.completed_at),
	});
};
