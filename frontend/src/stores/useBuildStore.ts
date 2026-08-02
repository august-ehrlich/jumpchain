import { create } from "zustand";
import { toast } from "sonner";
import type { Document, TraitCategory } from "../types/document";
import type { Build, Jumper, BuildStats } from "../types/jumper";

interface BuildState {
	document: Document | null;
	jumper: Jumper | null;
	buildToEdit: Build | null;
	
	selectedIds: Set<number>;
	buildAge: string;
	buildGender: string;
	hasRolledAge: boolean;
	stats: BuildStats;

	initBuild: (jumper: Jumper, document: Document, buildToEdit?: Build) => void;
	clearBuild: () => void;
	setBuildAge: (age: string) => void;
	setBuildGender: (gender: string) => void;
	setHasRolledAge: (rolled: boolean) => void;
	toggleTrait: (traitId: number, category: TraitCategory, isModifier: boolean) => void;
}

const evaluateRules = (document: Document, selectedIds: Set<number>, age: number) => {
	const modifiedCosts = new Map<number, number>();
	const lockedTraits = new Set<number>();
	let bypassAgeRoll = false;
	let bypassGenderLock = false;

	(document.rules || []).forEach((rule) => {
		// Evaluate Conditions (AND logic)
		const isTriggered = rule.conditions.every((cond) => {
			if (cond.type === "HAS_TRAIT" && cond.targetId) return selectedIds.has(cond.targetId);
			if (cond.type === "MISSING_TRAIT" && cond.targetId) return !selectedIds.has(cond.targetId);
			if (cond.type === "AGE_GREATER_THAN" && cond.value) return age > cond.value;
			return false;
		});

		// Apply Effects
		if (isTriggered) {
			rule.effects.forEach((effect) => {
				if (effect.type === "SET_COST" && effect.targetId) {
					modifiedCosts.set(effect.targetId, effect.value || 0);
				}
				if (effect.type === "MULTIPLY_COST" && effect.targetId) {
					const currentMultiplier = modifiedCosts.get(effect.targetId) || 1;
					modifiedCosts.set(effect.targetId, currentMultiplier * (effect.value || 1));
				}
				if (effect.type === "LOCK_TRAIT" && effect.targetId) {
					lockedTraits.add(effect.targetId);
				}
				if (effect.type === "BYPASS_AGE_ROLL") {
					bypassAgeRoll = true;
				}
				if (effect.type === "BYPASS_GENDER_LOCK") {
					bypassGenderLock = true;
				}
			});
		}
	});

	return { modifiedCosts, lockedTraits, bypassAgeRoll, bypassGenderLock };
};

const calculateStats = (document: Document, selectedIds: Set<number>, age: number): BuildStats => {
	let spentCp = 0;
	const catCounts: Record<number, number> = {};
	const traitMap = new Map();
	const finalCosts = new Map<number, number>();

	// Run the engine
	const { modifiedCosts, lockedTraits, bypassAgeRoll, bypassGenderLock } = evaluateRules(document, selectedIds, age);

	// Pre-calculate the exact final cost for EVERY trait so the UI always has accurate numbers
	document.categories.forEach((c) => {
		c.traits.forEach((t) => {
			let cost = t.cost;
			if (modifiedCosts.has(t.id)) {
				const modValue = modifiedCosts.get(t.id)!;
				cost = modValue <= 1 ? Math.round(cost * modValue) : modValue;
			}
			finalCosts.set(t.id, cost);
			traitMap.set(t.id, { trait: t, catId: c.id });
		});
	});

	selectedIds.forEach((id) => {
		const data = traitMap.get(id);
		if (!data) return;
		if (!data.trait.is_modifier) catCounts[data.catId] = (catCounts[data.catId] || 0) + 1;
		
		if (data.trait.cost < 0) {
			spentCp += data.trait.cost; // Drawbacks
		} else {
			spentCp += finalCosts.get(id) || 0; // Use the exact calculated cost
		}
	});

	return { 
		remainingCp: document.choice_points - spentCp, 
		catCounts, 
		traitMap, 
		lockedTraits, 
		bypassAgeRoll, 
		bypassGenderLock, 
		finalCosts 
	};
};

export const useBuildStore = create<BuildState>((set, get) => ({
	document: null,
	jumper: null,
	buildToEdit: null,
	selectedIds: new Set(),
	buildAge: "",
	buildGender: "",
	hasRolledAge: false,
	stats: { remainingCp: 0, catCounts: {}, traitMap: new Map(), lockedTraits: new Set(), bypassAgeRoll: false, bypassGenderLock: false, finalCosts: new Map() },

	initBuild: (jumper, document, buildToEdit) => {
		const initialSelected = new Set(buildToEdit?.traits.map((t) => t.id) || []);
		const startingAgeStr = buildToEdit?.age?.toString() || (document.has_random_age ? "" : jumper.age.toString());
		const initialAge = parseInt(startingAgeStr, 10) || 0;
		
		const initialStats = calculateStats(document, initialSelected, initialAge);

		// Determine if they've rolled based on the rule engine output
		const initHasRolled = !!(
			buildToEdit && document.has_random_age && !initialStats.bypassAgeRoll
		);

		set({
			document,
			jumper,
			buildToEdit,
			selectedIds: initialSelected,
			buildAge: startingAgeStr,
			buildGender: buildToEdit?.gender || jumper.gender,
			hasRolledAge: initHasRolled,
			stats: initialStats,
		});
	},

	clearBuild: () => set({ 
		document: null, jumper: null, buildToEdit: null, selectedIds: new Set(), 
		stats: { remainingCp: 0, catCounts: {}, traitMap: new Map(), lockedTraits: new Set(), bypassAgeRoll: false, bypassGenderLock: false, finalCosts: new Map() } 
	}),

	setBuildAge: (age) => {
		const state = get();
		if (state.document) {
			// Age changes could trigger rules! Recalculate stats.
			const newStats = calculateStats(state.document, state.selectedIds, parseInt(age, 10) || 0);
			set({ buildAge: age, stats: newStats });
		} else {
			set({ buildAge: age });
		}
	},
	
	setBuildGender: (gender) => set({ buildGender: gender }),
	setHasRolledAge: (rolled) => set({ hasRolledAge: rolled }),

	toggleTrait: (traitId, category, isModifier) => {
		const state = get();
		if (!state.document) return;

		// 3. Block selection if the engine locked this trait
		if (state.stats.lockedTraits.has(traitId)) {
			toast.error("This trait is currently locked by a rule.");
			return;
		}

		const newSelected = new Set(state.selectedIds);
		if (newSelected.has(traitId)) {
			newSelected.delete(traitId);
		} else {
			if (!isModifier && category.max_allowed !== -1 && (state.stats.catCounts[category.id] || 0) >= category.max_allowed) {
				toast.error(`You can only pick ${category.max_allowed} from ${category.name}`);
				return;
			}
			newSelected.add(traitId);
		}

		const currentAge = parseInt(state.buildAge, 10) || 0;
		set({
			selectedIds: newSelected,
			stats: calculateStats(state.document, newSelected, currentAge),
		});
	},
}));