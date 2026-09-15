export const ROLE_ID_VALUES = [
	"admin",
	"constr_manager",
	"accountant",
] as const;

export type RoleId = typeof ROLE_ID_VALUES[number];

export interface RoleIdOption {
	value: RoleId;
	label: string;
}
