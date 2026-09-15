export type Integration1CJobStatus = "queued" | "processing" | "completed";

export interface Integration1CJobDTO {
	id: number;
	command: string;
	params: unknown;
	correlation_id: string | null;
	metadata: Record<string, unknown>;
	status: Integration1CJobStatus;
	priority: number;
	available_at: string;
	attempt_count: number;
	max_attempts: number;
	locked_at: string | null;
	locked_by: string | null;
	last_error: string | null;
	created_at: string;
	updated_at: string;
	started_at: string | null;
	completed_at: string | null;
}

export interface Integration1CJob {
	id: number;
	command: string;
	params: unknown;
	correlation_id: string | null;
	metadata: Record<string, unknown>;
	status: Integration1CJobStatus;
	priority: number;
	available_at: Date;
	attempt_count: number;
	max_attempts: number;
	locked_at: Date | null;
	locked_by: string | null;
	last_error: string | null;
	created_at: Date;
	updated_at: Date;
	started_at: Date | null;
	completed_at: Date | null;
}

export type Integration1CJobKey = Pick<Integration1CJob, "id">;
