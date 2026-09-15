import type { Ref } from "vue";

import {
	SortDirect,
	type CollectionGridApi,
	type CollectionParams,
	type CollectionSorter,
} from "@katren/vue-collection-lib";

export interface LocalDocumentItem {
	id: number;
	line_num: number;
}

export interface LocalDocumentItemKey {
	id: number;
}

export interface UseLocalDocumentCollectionOptions<
	TItem extends LocalDocumentItem,
> {
	items: Ref<TItem[]>;
	createDefaults: () => Omit<Partial<TItem>, "id" | "line_num">;
}

const cloneItem = <TItem extends object>(item: TItem): TItem => {
	return {
		...item,
	};
};

const compareValues = (left: unknown, right: unknown): number => {
	if (typeof left === "number" && typeof right === "number") {
		return left - right;
	}

	return String(left ?? "").localeCompare(String(right ?? ""));
};

const sortItems = <TItem extends object>(
	items: TItem[],
	sorter: CollectionSorter[],
): TItem[] => {
	return [...items].sort((left, right) => {
		for (const item of sorter) {
			const leftValue = (left as Record<string, unknown>)[
				item.f
			];
			const rightValue = (right as Record<string, unknown>)[
				item.f
			];
			const result = compareValues(leftValue, rightValue);
			if (result !== 0) {
				return item.d === SortDirect.ASC
					? result
					: -result;
			}
		}

		return 0;
	});
};

export const useLocalDocumentCollection = <TItem extends LocalDocumentItem>(
	options: UseLocalDocumentCollectionOptions<TItem>,
) => {
	let nextTemporaryID = -1;

	const replaceItems = (items: TItem[]): void => {
		const normalized = items.map((item, index) => ({
			...item,
			line_num: index + 1,
		}));

		options.items.value = normalized as TItem[];
	};

	const allocateTemporaryID = (): number => {
		const smallestExistingID = options.items.value.reduce(
			(smallest, item) => Math.min(smallest, item.id),
			0,
		);
		nextTemporaryID = Math.min(
			nextTemporaryID,
			smallestExistingID - 1,
		);
		const result = nextTemporaryID;
		nextTemporaryID -= 1;
		return result;
	};

	const nextLineNumber = (): number => {
		return (
			options.items.value.reduce(
				(maximum, item) =>
					Math.max(maximum, item.line_num),
				0,
			) + 1
		);
	};

	const list = async (params?: CollectionParams) => {
		const sorter = params?.sorter?.length
			? params.sorter
			: [{ f: "line_num", d: SortDirect.ASC }];
		const allRows = sortItems(
			options.items.value.map(cloneItem),
			sorter,
		);
		const from = Math.max(0, params?.from ?? 0);
		const count = Math.max(0, params?.count ?? allRows.length);

		return {
			rows: allRows.slice(from, from + count),
			agg: {
				tot_count: allRows.length,
			},
		};
	};

	const api: CollectionGridApi<
		TItem,
		LocalDocumentItemKey,
		TItem,
		Partial<TItem>
	> = {
		list,
		create: async (model) => {
			replaceItems([
				...options.items.value,
				cloneItem(model),
			]);
			return {
				id: model.id,
			};
		},
		update: async (key, model) => {
			const index = options.items.value.findIndex((item) => {
				return item.id === key.id;
			});
			if (index < 0) {
				throw new Error(
					`Document item ${key.id} was not found`,
				);
			}

			const current = options.items.value[index];
			if (!current) {
				throw new Error(
					`Document item ${key.id} was not found`,
				);
			}
			const updated = {
				...current,
				...model,
				id: current.id,
			};
			const next = options.items.value.filter(
				(_, itemIndex) => {
					return itemIndex !== index;
				},
			);
			const requestedLineNumber = Number(
				model.line_num ?? current.line_num,
			);
			const insertAt = Number.isFinite(requestedLineNumber)
				? Math.min(
						Math.max(
							Math.trunc(
								requestedLineNumber,
							) - 1,
							0,
						),
						next.length,
					)
				: Math.min(index, next.length);
			next.splice(insertAt, 0, updated);
			replaceItems(next);
			return {
				affectedRows: 1,
			};
		},
		delete: async (key) => {
			const next = options.items.value.filter((item) => {
				return item.id !== key.id;
			});
			const affectedRows =
				next.length === options.items.value.length
					? 0
					: 1;
			replaceItems(next);
			return {
				affectedRows,
			};
		},
	};

	const createRow = (): TItem => {
		return {
			...options.createDefaults(),
			id: allocateTemporaryID(),
			line_num: nextLineNumber(),
		} as TItem;
	};

	return {
		api,
		getKey: (row: TItem): LocalDocumentItemKey => ({
			id: row.id,
		}),
		createRow,
		createModel: (row: TItem): TItem => cloneItem(row),
		defaultSorter: [
			{
				f: "line_num",
				d: SortDirect.ASC,
			},
		] satisfies CollectionSorter[],
	};
};
