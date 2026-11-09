import type { IDReference } from "@/types/orderDocument";
import type { Ref1C } from "@/types/ref1c";

// The id belongs to the order; item_id uniquely identifies the displayed line.
export interface OrderLineList {
	id: number;
	number_1c: string | null;
	shipment_number_1c: string | null;
	for_date: Date;
	status: IDReference | null;
	shipment_ref_1c: Ref1C | null;
	customer: IDReference | null;
	customer_sale_place: IDReference | null;
	product: IDReference | null;
	quant: number;
	requires_weight_confirmation: boolean;
	weight_confirmed: boolean;
	price: number | null;
	amount: number | null;
	vat_amount: number | null;
	use_marking: boolean;
	mercury: boolean;
	item_id: number;
	line_num: number;
	ref_1c: Ref1C | null;
	comment_customer: string | null;
	comment_admin: string | null;
}

export interface OrderLineListRow extends OrderLineList {
	group_start: boolean;
}

export interface OrderLinesMutationResponse {
	rows_affected: number;
}
