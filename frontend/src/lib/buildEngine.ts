import type { Document } from "../schemas/documentSchema";
import type { BuildStats } from "../types/jumper";

export const evaluateRules = (document: Document, selectedIds: Set<number>, age: number) => {
	const modifiedCosts = new Map<number, number>();
	const lockedTraits = new Set<number>();
	const categoryStipends = new Map<number, number>();
	
	let bypassAgeRoll = false;
	let bypassGenderLock = false;

	(document.rules || []).forEach((rule) => {
		const isTriggered = rule.conditions.every((cond) => {
			if (cond.type === "ALWAYS") return true; // NEW: Unconditional trigger
			if (cond.type === "HAS_TRAIT" && cond.targetId) return selectedIds.has(cond.targetId);
			if (cond.type === "MISSING_TRAIT" && cond.targetId) return !selectedIds.has(cond.targetId);
			if (cond.type === "AGE_GREATER_THAN" && cond.value) return age > cond.value;
			return false;
		});

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
				if (effect.type === "GRANT_CATEGORY_CP" && effect.targetId) {
					const currentStipend = categoryStipends.get(effect.targetId) || 0;
					categoryStipends.set(effect.targetId, currentStipend + (effect.value || 0));
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

	return { modifiedCosts, lockedTraits, bypassAgeRoll, bypassGenderLock, categoryStipends };
};

export const calculateStats = (document: Document, selectedIds: Set<number>, age: number): BuildStats => {
	const catCounts: Record<number, number> = {};
	const traitMap = new Map();
	const finalCosts = new Map<number, number>();
	
	const categorySpent = new Map<number, number>(); // Track positive spending per category
	let totalDrawbackGain = 0; // Track negative costs (points gained)

	const { modifiedCosts, lockedTraits, bypassAgeRoll, bypassGenderLock, categoryStipends } = evaluateRules(document, selectedIds, age);

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

	// Tally up spending and drawback gains
	selectedIds.forEach((id) => {
		const data = traitMap.get(id);
		if (!data) return;
		if (!data.trait.is_modifier) catCounts[data.catId] = (catCounts[data.catId] || 0) + 1;
		
		const cost = finalCosts.get(id) || 0;
		if (data.trait.cost < 0) {
			// Drawbacks always add to global CP (we keep it as a positive gain amount)
			totalDrawbackGain += Math.abs(cost); 
		} else {
			// Regular purchases tally up in their specific category
			categorySpent.set(data.catId, (categorySpent.get(data.catId) || 0) + cost);
		}
	});

	// Process Stipends: Calculate how much spills over to Global CP
	let totalSpilloverCost = 0;
	document.categories.forEach(c => {
		const spent = categorySpent.get(c.id) || 0;
		const stipend = categoryStipends.get(c.id) || 0;
		
		// If we spent more than the stipend, the remainder is spillover.
		// If we spent less, Math.max floors it at 0 (stipends don't refund into global CP).
		const spillover = Math.max(0, spent - stipend);
		totalSpilloverCost += spillover;
	});

	// Final Global CP = Starting CP + Drawback Gains - Total Spillover Costs
	const remainingCp = document.choice_points + totalDrawbackGain - totalSpilloverCost;

	return { 
		remainingCp, 
		catCounts, 
		traitMap, 
		lockedTraits, 
		bypassAgeRoll, 
		bypassGenderLock, 
		finalCosts 
	};
};