import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type { Document, TraitCategory } from "../types/document";
import type { Build, Jumper } from "../types/jumper";
import { calculateTraitCost } from "../utils/buildUtils";

export function useBuildEditor(jumper: Jumper, document: Document, buildToEdit?: Build) {
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		new Set(buildToEdit?.traits.map((t) => t.id) || []),
	);

	const [buildAge, setBuildAge] = useState<string>(
		buildToEdit?.age?.toString() || (document.has_random_age ? "" : jumper.age.toString())
	);
	
	const [buildGender, setBuildGender] = useState<string>(
		buildToEdit?.gender || jumper.gender
	);

	const bypassAgeId = document.age_bypass_trait_id;
	const initHasRolled = !!(
		buildToEdit &&
		document.has_random_age &&
		(!bypassAgeId || !buildToEdit.traits.some(t => t.id === bypassAgeId))
	);
	
	const [hasRolledAge, setHasRolledAge] = useState<boolean>(initHasRolled);

	const stats = useMemo(() => {
		let spentCp = 0;
		const catCounts: Record<number, number> = {};
		const traitMap = new Map();

		document.categories.forEach((c) => {
			c.traits.forEach((t) => { traitMap.set(t.id, { trait: t, catId: c.id }); });
		});

		selectedIds.forEach((id) => {
			const data = traitMap.get(id);
			if (!data) return;

			if (!data.trait.is_modifier) {
				catCounts[data.catId] = (catCounts[data.catId] || 0) + 1;
			}

			if (data.trait.cost < 0) {
				spentCp += data.trait.cost;
			} else {
				spentCp += calculateTraitCost(data.trait.cost, data.trait.discounts_received, selectedIds);
			}
		});

		return { remainingCp: document.choice_points - spentCp, catCounts, traitMap };
	}, [selectedIds, document]);

	const toggleTrait = useCallback((traitId: number, category: TraitCategory, isModifier: boolean) => {
		setSelectedIds((prev) => {
			const newSelected = new Set(prev);
			if (newSelected.has(traitId)) {
				newSelected.delete(traitId);
			} else {
				if (!isModifier && category.max_allowed !== -1 && (stats.catCounts[category.id] || 0) >= category.max_allowed) {
					toast.error(`You can only pick ${category.max_allowed} from ${category.name}`);
					return prev;
				}
				newSelected.add(traitId);
			}
			return newSelected;
		});
	}, [stats.catCounts]);

	return {
		selectedIds,
		buildAge,
		setBuildAge,
		buildGender,
		setBuildGender,
		hasRolledAge,
		setHasRolledAge,
		stats,
		toggleTrait,
	};
}