import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { TraitCategory } from "../schemas/documentSchema";

export function useTraitRoller(onToggle: (id: number, cat: TraitCategory, isMod: boolean) => void) {
	const [rollingCategory, setRollingCategory] = useState<number | null>(null);
	const [rollingName, setRollingName] = useState<string>("");
	const [wildcardWins, setWildcardWins] = useState<Set<number>>(new Set());

	const triggerRoll = useCallback((cat: TraitCategory, freePickId: number | null = null) => {
		const options = cat.traits.filter((t) => !t.is_modifier);
		if (options.length === 0) return;

		setRollingCategory(cat.id);

		let counter = 0;
		const interval = setInterval(() => {
			const randomTrait = options[Math.floor(Math.random() * options.length)];
			setRollingName(randomTrait.name || "Unknown Trait");
			counter++;

			if (counter > 30) {
				clearInterval(interval);
				const finalTrait = options[Math.floor(Math.random() * options.length)];
				setRollingName(finalTrait.name || "Unknown Trait");
				
				setTimeout(() => {
					if (finalTrait.id === freePickId) {
						setWildcardWins((prev) => new Set(prev).add(cat.id));
						toast.success(`You rolled ${finalTrait.name}! It's a Wildcard! Choose your path freely.`);
					} else {
						onToggle(finalTrait.id, cat, false);
					}
					setRollingCategory(null);
				}, 600);
			}
		}, 50);
	}, [onToggle]);

	return { rollingCategory, rollingName, wildcardWins, triggerRoll };
}