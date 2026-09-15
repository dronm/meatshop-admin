import { createI18n } from "vue-i18n";
import { collectionLibMessages } from "@katren/vue-collection-lib/locales";

import ru from "../locales/ru.json";
import ruGen from "../locales/ru.gen.json";

type LocaleMessages = Record<string, unknown>;

const isRecord = (value: unknown): value is LocaleMessages => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const deepMerge = (
	base: LocaleMessages,
	override: LocaleMessages,
): LocaleMessages => {
	const result: LocaleMessages = {
		...base,
	};

	for (const [key, value] of Object.entries(override)) {
		const baseValue = result[key];

		if (isRecord(baseValue) && isRecord(value)) {
			result[key] = deepMerge(baseValue, value);
			continue;
		}

		result[key] = value;
	}

	return result;
};

const messages = {
	ru: deepMerge(
		deepMerge(
			collectionLibMessages.ru as LocaleMessages,
			ruGen as LocaleMessages,
		),
		ru as LocaleMessages,
	),
};

export const i18n = createI18n({
	legacy: false,
	locale: "ru",
	fallbackLocale: "ru",
	messages,
} as Parameters<typeof createI18n>[0]);
