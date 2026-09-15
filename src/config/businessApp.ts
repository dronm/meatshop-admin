import type { BusinessAppConfig } from "@katren/vue-business-app/core";

import api from "@/api/http";
import { i18n } from "@/i18n";
import { applicationRouteManifest } from "@/router/routeManifest";
import { RoleIdSchema } from "@/schemas/enums/roleId";
import type { RoleId } from "@/types/enums/roleId";

const translate = (
	key: string,
	params: Record<string, unknown> = {},
): string => {
	return String(
		i18n.global.t(
			key,
			params as Record<string, string | number | boolean>,
		),
	);
};

export const businessAppConfig: BusinessAppConfig<RoleId> = {
	api,
	branding: {
		title: "Myasomasters",
		subtitle: "Система управления",
		fallbackMark: "Meatshop",
	},
	applicationRouteManifest,
	roles: {
		options: [
			{
				value: "admin",
				label: translate("RoleId.admin"),
			}
		],
		defaultRoleId: "admin",
		schema: RoleIdSchema,
	},
	userReferenceRoutes: {
		list: {
			name: "users",
		},
		edit: (id: number) => ({
			name: "userEdit",
			params: {
				id,
			},
		}),
	},
	translate,
};
