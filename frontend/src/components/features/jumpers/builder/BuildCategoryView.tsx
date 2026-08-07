import { useMemo } from "react";
import type { Document, TraitCategory } from "../../../../schemas/documentSchema";
import type { BuildStats } from "../../../../types/jumper";
import { TabsContent } from "../../../ui/tabs";
import { Button } from "../../../ui/button";
import { BuildTraitCard } from "./BuildTraitCard";
import { RankedTraitList } from "./RankedTraitList"; // <-- Import the new component
import { Dices, Sparkles } from "lucide-react";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";
import { useTraitRoller } from "../../../../hooks/useTraitRoller";

export function BuildCategoryView({
	document,
	selectedIds,
	stats,
	hasRolledAge,
	onToggle,
	categoryOrders = {}, 
	onOrderChange,
}: {
	document: Document;
	selectedIds: Set<number>;
	stats: BuildStats;
	hasRolledAge: boolean;
	onToggle: (id: number, cat: TraitCategory, isMod: boolean) => void;
	categoryOrders?: Record<number, number[]>;
	onOrderChange?: (categoryId: number, newIds: number[]) => void;
}) {
	const { rollingCategory, rollingName, wildcardWins, triggerRoll } = useTraitRoller(onToggle);

	const ruleMetadata = useMemo(() => {
		const catMap = new Map<number, { bypass: number | null; freePick: number | null }>();
		let globalAgeBypass: number | null = null;

		document.rules?.forEach(rule => {
			const hasTraitCond = rule.conditions.find(c => c.type === "HAS_TRAIT");
			if (!hasTraitCond?.targetId) return;
			const triggerId = hasTraitCond.targetId;

			rule.effects.forEach(eff => {
				if (eff.type === "BYPASS_AGE_ROLL") globalAgeBypass = triggerId;
				
				if (eff.type === "BYPASS_CATEGORY_LIMIT" && eff.targetId) {
					const current = catMap.get(eff.targetId) || { bypass: null, freePick: null };
					current.bypass = triggerId;
					catMap.set(eff.targetId, current);
				}
				
				if (eff.type === "FREE_PICK_CATEGORY" && eff.targetId) {
					const current = catMap.get(eff.targetId) || { bypass: null, freePick: null };
					current.freePick = triggerId;
					catMap.set(eff.targetId, current);
				}
			});
		});

		return { catMap, globalAgeBypass };
	}, [document.rules]);

	const getTraitCost = (traitId: number) => {
		return stats.finalCosts.get(traitId) ?? 0;
	};

	return (
		<>
			{document.categories.map((cat) => {
				const isRandom = cat.is_random;
				
				const categoryRules = ruleMetadata.catMap.get(cat.id);
				const bypassTraitId = categoryRules?.bypass ?? null;
				const freePickTraitId = categoryRules?.freePick ?? null;
				
				const isBypassed = bypassTraitId ? selectedIds.has(bypassTraitId) : false;
				const hasWonWildcard = wildcardWins.has(cat.id);

				const nonModifierIds = cat.traits.filter((t) => !t.is_modifier).map((t) => t.id);
				const rolledTraitId = nonModifierIds.find((id) => selectedIds.has(id));
				const hasRolled = !!rolledTraitId;

				const isResolved = !isRandom || isBypassed || hasRolled || hasWonWildcard;
				const isRollingThis = rollingCategory === cat.id;

				return (
					<TabsContent
						key={cat.id}
						value={cat.id.toString()}
						className="flex-1 overflow-y-auto p-8 m-0 outline-none"
					>
						<div className="max-w-4xl mx-auto space-y-6 pb-24">
							<div className="mb-8">
								<h3 className="text-3xl font-bold mb-4">{cat.name}</h3>
								{cat.summary && (
									<div className="text-base text-muted-foreground border-l-4 border-primary/40 pl-6 py-1 italic">
										<MarkdownViewer content={cat.summary} />
									</div>
								)}
							</div>

							{!isResolved || isRollingThis ? (
								<div className="flex flex-col items-center justify-center py-20 mt-4 space-y-6 border-2 border-dashed border-primary/20 rounded-2xl bg-muted/10">
									<Dices size={64} className={`text-primary ${isRollingThis ? "animate-spin" : ""}`} />
									<h2 className="text-3xl font-bold">
										{isRollingThis ? "Rolling Destiny..." : "Fate Approaches"}
									</h2>

									<div className="h-12 flex items-center justify-center">
										{isRollingThis ? (
											<span className="text-2xl font-black bg-primary/20 px-6 py-2 rounded-lg text-primary shadow-inner">
												{rollingName}
											</span>
										) : (
											<p className="text-muted-foreground text-center max-w-md">
												This category requires a random roll to determine your path.
											</p>
										)}
									</div>

									{!isRollingThis && (
										<div className="flex gap-4 items-center mt-4">
											<Button
												size="lg"
												onClick={() => triggerRoll(cat, freePickTraitId)}
												className="text-lg px-8 h-14"
											>
												Roll the Dice
											</Button>

											{bypassTraitId && (
												<Button
													size="lg"
													variant="outline"
													onClick={() => onToggle(bypassTraitId, cat, true)}
													className="text-lg px-8 h-14 border-primary/20 hover:border-primary/50"
												>
													Bypass (Cost: {getTraitCost(bypassTraitId)} CP)
												</Button>
											)}
										</div>
									)}
								</div>
							) : (
								<div className="space-y-4">
									{hasWonWildcard && (
										<div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-center gap-3 text-primary mb-6">
											<Sparkles className="h-6 w-6" />
											<div>
												<p className="font-bold">Wildcard Rolled!</p>
												<p className="text-sm opacity-90">You evaded the whims of fate. You may now pick your traits freely.</p>
											</div>
										</div>
									)}
								
									{cat.is_ordering ? (
										<RankedTraitList 
											traits={cat.traits}
											orderedIds={categoryOrders[cat.id] || []}
											onOrderChange={(newIds) => onOrderChange?.(cat.id, newIds)}
										/>
									) : (
										cat.traits.map((trait) => {
											if (trait.id === freePickTraitId && (hasWonWildcard || isBypassed)) return null;
											if (trait.id === bypassTraitId && (hasWonWildcard || hasRolled)) return null;
											if (hasRolledAge && trait.id === ruleMetadata.globalAgeBypass) return null;

											const isLockedNonModifier = isRandom && !isBypassed && !hasWonWildcard && !trait.is_modifier;
											const isBypassLocked = hasRolled && trait.id === bypassTraitId;
											
											const isLocked = isLockedNonModifier || isBypassLocked || stats.lockedTraits.has(trait.id);

											return (
												<BuildTraitCard
													key={trait.id}
													trait={trait}
													category={cat}
													isSelected={selectedIds.has(trait.id)}
													isLocked={isLocked}
													finalCost={getTraitCost(trait.id)}
													onToggle={() => {
														if (isLocked) return;
														onToggle(trait.id, cat, trait.is_modifier);
													}}
												/>
											);
										})
									)}
								</div>
							)}
						</div>
					</TabsContent>
				);
			})}
		</>
	);
}