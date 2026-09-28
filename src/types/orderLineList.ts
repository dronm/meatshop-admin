import type { IDReference } from "@/types/orderDocument";
import type { Ref1C } from "@/types/ref1c";

// The id belongs to the order; item_id uniquely identifies the displayed line.
export interface OrderLineList {
	id: number;
	shipment_ref_1c: Ref1C | null;
	customer: IDReference | null;
	customer_sale_place: IDReference | null;
	product: IDReference | null;
	quant: number;
	price: number | null;
	amount: number | null;
	vat_amount: number | null;
	use_marking: boolean;
	item_id: number;
	line_num: number;
	ref_1c: Ref1C | null;
}

export interface OrderLineListRow extends OrderLineList {
	group_start: boolean;
}
