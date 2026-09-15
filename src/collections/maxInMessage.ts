import { maxInMessageCollection as generatedMaxInMessageCollection } from "@/collections/maxInMessage.gen";
import { formatReference } from "@/utils/reference";

const maxInMessageColumns = generatedMaxInMessageCollection.columns.map(
	(column) => {
		if (column.field !== "max_user") {
			return column;
		}

		return {
			...column,
			format: formatReference,
		};
	},
);

export const maxInMessageCollection = {
	...generatedMaxInMessageCollection,
	columns: maxInMessageColumns,
};
