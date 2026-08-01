import { create } from "zustand";
import { toast } from "sonner";
import type { Document, TraitCategory } from "../types/document";
import type { Build, Jumper, BuildStats } from "../types/jumper";
import { calculateTraitCost } from "../utils/buildUtils";

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

// Helper to recalculate stats
const calculateStats = (document: Document, selectedIds: Set<number>): BuildStats => {
	let spentCp = 0;
	const catCounts: Record<number, number> = {};
	const traitMap = new Map();

	document.categories.forEach((c) => {
		c.traits.forEach((t) => { traitMap.set(t.id, { trait: t, catId: c.id }); });
	});

	selectedIds.forEach((id) => {
		const data = traitMap.get(id);
		if (!data) return;
		if (!data.trait.is_modifier) catCounts[data.catId] = (catCounts[data.catId] || 0) + 1;
		
		spentCp += data.trait.cost < 0 
			? data.trait.cost 
			: calculateTraitCost(data.trait.cost, data.trait.discounts_received, selectedIds);
	});

	return { remainingCp: document.choice_points - spentCp, catCounts, traitMap };
};

export const useBuildStore = create<BuildState>((set, get) => ({
	document: null,
	jumper: null,
	buildToEdit: null,
	selectedIds: new Set(),
	buildAge: "",
	buildGender: "",
	hasRolledAge: false,
	stats: { remainingCp: 0, catCounts: {}, traitMap: new Map() },

	initBuild: (jumper, document, buildToEdit) => {
		const bypassAgeId = document.age_bypass_trait_id;
		const initHasRolled = !!(
			buildToEdit && document.has_random_age &&
			(!bypassAgeId || !buildToEdit.traits.some(t => t.id === bypassAgeId))
		);
		const initialSelected = new Set(buildToEdit?.traits.map((t) => t.id) || []);

		set({
			document,
			jumper,
			buildToEdit,
			selectedIds: initialSelected,
			buildAge: buildToEdit?.age?.toString() || (document.has_random_age ? "" : jumper.age.toString()),
			buildGender: buildToEdit?.gender || jumper.gender,
			hasRolledAge: initHasRolled,
			stats: calculateStats(document, initialSelected),
		});
	},

	clearBuild: () => set({ document: null, jumper: null, buildToEdit: null, selectedIds: new Set() }),
	setBuildAge: (age) => set({ buildAge: age }),
	setBuildGender: (gender) => set({ buildGender: gender }),
	setHasRolledAge: (rolled) => set({ hasRolledAge: rolled }),

	toggleTrait: (traitId, category, isModifier) => {
		const state = get();
		if (!state.document) return;

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

		set({
			selectedIds: newSelected,
			stats: calculateStats(state.document, newSelected),
		});
	},
}));