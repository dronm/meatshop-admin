import { maxUserCollection as generatedMaxUserCollection } from "@/collections/maxUser.gen";

const formatReference = (value: unknown): string => {
	if (value === null || typeof value !== "object") {
		return "";
	}

	const descr = (value as { descr?: unknown }).descr;
	return typeof descr === "string" ? descr : "";
};

const maxUserColumns = generatedMaxUserCollection.columns.map((column) => {
	if (
		column.field !== "customer" &&
		column.field !== "customer_sale_place"
	) {
		return column;
	}

	return {
		...column,
		format: formatReference,
	};
});

export const maxUserCollection = {
	...generatedMaxUserCollection,
	columns: maxUserColumns,
};
