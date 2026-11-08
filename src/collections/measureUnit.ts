import { measureUnitCollection as generatedMeasureUnitCollection } from "@/collections/measureUnit.gen";
import { collectionGridOptions } from "@/config/collectionGrid";

export const measureUnitCollection = {
	...generatedMeasureUnitCollection,
	...collectionGridOptions,
};
