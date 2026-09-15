import type { Ref1C } from "@/types/ref1c";
import type { Integration1CJobStatus } from "@/types/integration1cJob";

export type { Ref1C } from "@/types/ref1c";

export interface IDReference {
	keys: {
		id: number;
	};
	descr: string;
}

export interface OrderDocumentItem {
	id: number;
	line_num: number;
	product_id: number;
	measure_unit_id: number;
	quant_required: number;
	quant: number;
}

export interface OrderDetailItem extends OrderDocumentItem {
	product: IDReference | null;
	measure_unit: IDReference | null;
}

export interface OrderDocument {
	id: number;
	version: number;
	for_date: Date;
	number_1c: string | null;
	ref_1c: Ref1C | null;
	shipment_ref_1c: Ref1C | null;
	customer_id: number;
	customer_sale_place_id: number;
	customer_user_id: number | null;
	status_id: number | null;
	comment_customer: string | null;
	comment_admin: string | null;
	items: OrderDocumentItem[];
}

export interface OrderDetail extends Omit<OrderDocument, "items"> {
	customer: IDReference | null;
	customer_sale_place: IDReference | null;
	customer_user: IDReference | null;
	status: IDReference | null;
	items: OrderDetailItem[];
}

export interface OrderKey {
	id: number;
}

export interface OrderFormModel {
	id: number;
	version: number;
	for_date: Date | null;
	number_1c: string | null;
	ref_1c: Ref1C | null;
	shipment_ref_1c: Ref1C | null;
	customer_id: number | null;
	customer: IDReference | null;
	customer_sale_place_id: number | null;
	customer_sale_place: IDReference | null;
	customer_user_id: number | null;
	customer_user: IDReference | null;
	status_id: number | null;
	status: IDReference | null;
	comment_customer: string | null;
	comment_admin: string | null;
	items: OrderDocumentItem[];
}

export interface Order1CJobResponse {
	job_id: number;
	status: Integration1CJobStatus;
}
