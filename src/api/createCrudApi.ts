import api from "@/api/http";

import {
	createCrudApi as createLibraryCrudApi,
	normalizeCollectionResponse,
	type CollectionAgg,
	type CollectionDTO,
	type CollectionResponse,
	type CreateCrudApiOptions,
} from "@katren/vue-collection-lib";

export type {
	CollectionAgg,
	CollectionDTO,
	CollectionResponse,
};

export { normalizeCollectionResponse };

export const createCrudApi = <
	TListModel,
	TListDTO,
	TDetailModel,
	TDetailDTO,
	TKey,
	TNew,
	TUpd,
>(
	options: Omit<
		CreateCrudApiOptions<
			TListModel,
			TListDTO,
			TDetailModel,
			TDetailDTO,
			TKey,
			TNew,
			TUpd
		>,
		"api"
	>,
) => {
	return createLibraryCrudApi<
		TListModel,
		TListDTO,
		TDetailModel,
		TDetailDTO,
		TKey,
		TNew,
		TUpd
	>({
		...options,
		api,
	});
};
