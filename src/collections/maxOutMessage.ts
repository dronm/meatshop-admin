import { maxOutMessageCollection as generatedMaxOutMessageCollection } from "@/collections/maxOutMessage.gen";
import { formatReference } from "@/utils/reference";

const maxOutMessageColumns = generatedMaxOutMessageCollection.columns.map(
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

export const maxOutMessageCollection = {
	...generatedMaxOutMessageCollection,
	columns: maxOutMessageColumns,
};
