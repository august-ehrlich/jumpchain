export const CONDITION_TYPES = [
	{ value: "HAS_TRAIT", label: "Has Trait (ID)" },
	{ value: "MISSING_TRAIT", label: "Is Missing Trait (ID)" },
	{ value: "AGE_GREATER_THAN", label: "Age is Greater Than" },
];

export const EFFECT_TYPES = [
	{ value: "SET_COST", label: "Set Trait Cost" },
	{ value: "MULTIPLY_COST", label: "Multiply Trait Cost" },
	{ value: "LOCK_TRAIT", label: "Lock Trait (Prevent Selection)" },
	{ value: "BYPASS_AGE_ROLL", label: "Bypass Random Age Roll" },
	{ value: "BYPASS_GENDER_LOCK", label: "Bypass Gender Lock" },
];