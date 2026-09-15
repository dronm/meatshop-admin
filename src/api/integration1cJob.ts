import { createCrudApi } from "@/api/createCrudApi";
import { integration1CJobFromDTO } from "@/schemas/integration1cJob";
import type {
	Integration1CJob,
	Integration1CJobDTO,
	Integration1CJobKey,
} from "@/types/integration1cJob";

const integration1CJobCrudApi = createCrudApi<
	Integration1CJob,
	Integration1CJobDTO,
	Integration1CJob,
	Integration1CJobDTO,
	Integration1CJobKey,
	never,
	never
>({
	basePath: "/integration-1c/jobs",
	serviceName: "Integration1CJob",
	getKeyValue: (key: Integration1CJobKey): number => {
		return key.id;
	},
	fromListDTO: integration1CJobFromDTO,
	fromDetailDTO: integration1CJobFromDTO,
});

export const integration1CJobApi = {
	serviceName: integration1CJobCrudApi.serviceName,
	list: integration1CJobCrudApi.list,
};
