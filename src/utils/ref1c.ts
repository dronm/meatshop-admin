import type { Ref1C } from "@/types/ref1c";

export const normalizeRef1C = (value: unknown): Ref1C | null => {
	if (
		typeof value !== "object" ||
		value === null ||
		Array.isArray(value)
	) {
		return null;
	}

	const record = value as Record<string, unknown>;
	const id = typeof record.id === "string" ? record.id.trim() : "";
	const descr = typeof record.descr === "string"
		? record.descr.trim()
		: "";

	if (id.length === 0) {
		return null;
	}

	return {
		id,
		descr: descr || id,
	};
};

export const ref1CDescription = (value: unknown): string => {
	return normalizeRef1C(value)?.descr ?? "";
};
