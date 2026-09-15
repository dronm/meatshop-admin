import { createCrudApi } from "@/api/createCrudApi";
import { customerUserFromDTO } from "@/schemas/customerUser";
import type {
	CustomerUser,
	CustomerUserDTO,
	CustomerUserKey,
} from "@/types/customerUser";

const customerUserCrudApi = createCrudApi<
	CustomerUser,
	CustomerUserDTO,
	CustomerUser,
	CustomerUserDTO,
	CustomerUserKey,
	never,
	never
>({
	basePath: "/customer-users",
	serviceName: "CustomerUser",
	getKeyValue: (key: CustomerUserKey): number => {
		return key.id;
	},
	fromListDTO: customerUserFromDTO,
	fromDetailDTO: customerUserFromDTO,
});

export const customerUserApi = {
	serviceName: customerUserCrudApi.serviceName,
	list: customerUserCrudApi.list,
};
