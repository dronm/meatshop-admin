import { computed, onMounted, ref, type Ref } from "vue";
import {
	useRoute,
	useRouter,
	type RouteLocationNormalizedLoaded,
	type RouteLocationRaw,
	type RouteRecordName,
} from "vue-router";

import {
	collectionFormSubmitErrorEvent,
	collectionFormSubmitSuccessEvent,
	useFormErrors,
	type CollectionFormMode,
} from "@katren/vue-collection-lib";

interface DocumentEditApi<TKey, TDocument, TSave> {
	detail: (key: TKey) => Promise<TDocument>;
	create: (document: TSave) => Promise<TDocument>;
	update: (key: TKey, document: TSave) => Promise<TDocument>;
}

export interface UseDocumentEditPageOptions<
	TForm extends object,
	TKey,
	TDocument,
	TSave,
> {
	api: DocumentEditApi<TKey, TDocument, TSave>;
	createRouteName: RouteRecordName;
	listRoute: RouteLocationRaw | (() => RouteLocationRaw);
	keyFromRoute: (route: RouteLocationNormalizedLoaded) => TKey;
	keyFromDocument: (document: TDocument) => TKey;
	copyKeyFromRoute?: (
		route: RouteLocationNormalizedLoaded,
	) => TKey | null;
	createModel: () => TForm;
	fromDocument: (document: TDocument) => TForm;
	copyModel?: (document: TDocument) => TForm;
	validate?: (
		document: TSave,
		mode: CollectionFormMode,
	) => TSave | Promise<TSave>;
}

const dispatchDocumentFormEvent = (name: string, detail: unknown): void => {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(name, {
			detail,
		}),
	);
};

export const useDocumentEditPage = <
	TForm extends object,
	TKey,
	TDocument,
	TSave,
>(
	options: UseDocumentEditPageOptions<TForm, TKey, TDocument, TSave>,
) => {
	const route = useRoute();
	const router = useRouter();
	const loading = ref(false);
	const submitting = ref(false);
	const model = ref(options.createModel()) as Ref<TForm>;
	const errors = useFormErrors();
	const isCreateRoute = computed(() => {
		return route.name === options.createRouteName;
	});
	const mode = computed<CollectionFormMode>(() => {
		if (!isCreateRoute.value) {
			return "edit";
		}

		return options.copyKeyFromRoute?.(route) ? "copy" : "create";
	});
	const key = computed(() => options.keyFromRoute(route));

	const goBack = async (): Promise<void> => {
		const target =
			typeof options.listRoute === "function"
				? options.listRoute()
				: options.listRoute;
		await router.push(target);
	};

	const load = async (): Promise<void> => {
		loading.value = true;
		try {
			errors.clear();
			if (mode.value === "edit") {
				const document = await options.api.detail(
					key.value,
				);
				model.value = options.fromDocument(document);
				return;
			}

			if (mode.value === "copy") {
				const copyKey =
					options.copyKeyFromRoute?.(route);
				if (copyKey !== null && copyKey !== undefined) {
					const document =
						await options.api.detail(
							copyKey,
						);
					model.value = options.copyModel
						? options.copyModel(document)
						: options.fromDocument(
								document,
							);
					return;
				}
			}

			model.value = options.createModel();
		} catch (err: unknown) {
			errors.setFromError(err);
		} finally {
			loading.value = false;
		}
	};

	const submit = async (value: TSave): Promise<void> => {
		submitting.value = true;
		errors.clear();

		try {
			const document = options.validate
				? await options.validate(value, mode.value)
				: value;
			const saved =
				mode.value === "edit"
					? await options.api.update(
							key.value,
							document,
						)
					: await options.api.create(document);
			const savedKey = options.keyFromDocument(saved);

			model.value = options.fromDocument(saved);
			dispatchDocumentFormEvent(
				collectionFormSubmitSuccessEvent,
				{
					operation:
						mode.value === "edit"
							? "update"
							: "create",
					key: savedKey,
					document: saved,
				},
			);

			await goBack();
		} catch (err: unknown) {
			errors.setFromError(err);
			dispatchDocumentFormEvent(
				collectionFormSubmitErrorEvent,
				err,
			);
		} finally {
			submitting.value = false;
		}
	};

	onMounted(load);

	return {
		mode,
		key,
		model,
		loading,
		submitting,
		errors,
		load,
		submit,
		goBack,
	};
};
