const referenceID = (value: unknown): number | null => {
	if (
		value === null ||
		typeof value !== "object" ||
		Array.isArray(value)
	) {
		return null;
	}

	const keys = (value as { keys?: unknown }).keys;
	if (keys === null || typeof keys !== "object" || Array.isArray(keys)) {
		return null;
	}

	const id = (keys as { id?: unknown }).id;
	return typeof id === "number" && Number.isInteger(id) && id > 0
		? id
		: null;
};

export const nextOrderStatusID = (
	rows: readonly { status: unknown }[],
): number | null => {
	const statuses = new Set(rows.map((row) => referenceID(row.status)));
	if (statuses.size !== 1) {
		return null;
	}

	// Workflow order differs from the existing numeric status IDs.
	switch (statuses.values().next().value) {
		case 1:
			return 3;
		case 3:
			return 2;
		case 2:
			return 4;
		case 4:
			return 5;
		default:
			return null;
	}
};

export const orderStatusClass = (row: { status: unknown }): string => {
	switch (referenceID(row.status)) {
		case 1:
			return "order-status-new";
		case 2:
			return "order-status-accepted";
		case 3:
			return "order-status-processing";
		case 4:
			return "order-status-approved";
		case 5:
			return "order-status-completed";
		case 6:
			return "order-status-cancelled";
		default:
			return "";
	}
};
