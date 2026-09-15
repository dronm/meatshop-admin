import type { MaybeRefOrGetter, Ref } from "vue";

import { useCollectionFormModel } from "@katren/vue-collection-lib";

export interface DocumentFormWithItems<TItem extends object> {
	date: Date | undefined;
	items: TItem[];
}

export interface UseDocumentFormModelOptions<
	TItem extends object,
	TForm extends DocumentFormWithItems<TItem>,
> {
	model: MaybeRefOrGetter<Partial<TForm> | null | undefined>;
	defaults: () => TForm;
}

export const useDocumentFormModel = <
	TItem extends object,
	TForm extends DocumentFormWithItems<TItem>,
>(
	options: UseDocumentFormModelOptions<TItem, TForm>,
): {
	form: Ref<TForm>;
	reset: () => void;
} => {
	return useCollectionFormModel<TForm>({
		model: options.model,
		defaults: options.defaults,
		fromModel: (model, defaults) => ({
			...defaults,
			...model,
			date: model.date ?? defaults.date,
			items: (model.items ?? defaults.items).map((item) => ({
				...item,
			})),
		}),
	});
};

export const orderedDocumentItems = <
	TItem extends {
		line_num: number;
	},
>(
	items: TItem[],
): TItem[] => {
	return items
		.map((item, index) => ({
			item,
			index,
		}))
		.sort((left, right) => {
			return (
				left.item.line_num - right.item.line_num ||
				left.index - right.index
			);
		})
		.map(({ item }) => item);
};
