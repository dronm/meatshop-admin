export const formatReference = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return "";
	}

	const descr = (value as { descr?: unknown }).descr;
	return typeof descr === "string" ? descr : "";
};
