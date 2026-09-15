import { useI18n } from "vue-i18n";

import { createUserSchemas } from "@/schemas/user";

export const useUserSchemas = () => {
	const { t } = useI18n();

	return createUserSchemas(t);
};
