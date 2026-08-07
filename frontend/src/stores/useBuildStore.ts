import { create } from "zustand";
import { toast } from "sonner";
import { calculateStats } from "../lib/buildEngine"
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

	// Added state for the Ordering feature
	categoryOrders: Record<number, number[]>;

	initBuild: (jumper: Jumper, document: Document, buildToEdit?: Build) => void;
	clearBuild: () => void;
	setBuildAge: (age: string) => void;
	setBuildGender: (gender: string) => void;
	setHasRolledAge: (rolled: boolean) => void;
	toggleTrait: (traitId: number, category: TraitCategory, isModifier: boolean) => void;
	
	setCategoryOrder: (categoryId: number, newIds: number[]) => void;
}

export const useBuildStore = create<BuildState>((set, get) => ({
	document: null,
	jumper: null,
	buildToEdit: null,
	selectedIds: new Set(),
	buildAge: "",
	buildGender: "",
	hasRolledAge: false,
	categoryOrders: {}, // Initialize ordering state
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
			categoryOrders: {}, // Clear orders on init (you can load from buildToEdit here later if you save it!)
			stats: initialStats,
		});
	},

	clearBuild: () => set({ 
		document: null, jumper: null, buildToEdit: null, selectedIds: new Set(), 
		categoryOrders: {},
		stats: { remainingCp: 0, catCounts: {}, traitMap: new Map(), lockedTraits: new Set(), bypassAgeRoll: false, bypassGenderLock: false, finalCosts: new Map() } 
	}),

	setBuildAge: (age) => {
		const state = get();
		if (state.document) {
			const newStats = calculateStats(state.document, state.selectedIds, parseInt(age, 10) || 0);
			set({ buildAge: age, stats: newStats });
		} else {
			set({ buildAge: age });
		}
	},
	
	setBuildGender: (gender) => set({ buildGender: gender }),
	setHasRolledAge: (rolled) => set({ hasRolledAge: rolled }),
	
	setCategoryOrder: (categoryId, newIds) => {
		set((state) => ({
			categoryOrders: {
				...state.categoryOrders,
				[categoryId]: newIds
			}
		}));
	},

	toggleTrait: (traitId, category, isModifier) => {
		const state = get();
		if (!state.document) return;

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