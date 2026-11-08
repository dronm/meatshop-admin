import { customerCollection as generatedCustomerCollection } from "@/collections/customer.gen";
import { collectionGridOptions } from "@/config/collectionGrid";

export const customerCollection = {
	...generatedCustomerCollection,
	...collectionGridOptions,
};
