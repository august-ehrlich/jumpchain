import type { Document, TraitCategory } from "../../../../types/document";
import type { BuildStats } from "../../../../types/jumper";
import { TabsContent } from "../../../ui/tabs";
import { Button } from "../../../ui/button";
import { BuildTraitCard } from "./BuildTraitCard";
import { Dices, Sparkles } from "lucide-react";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";
import { calculateTraitCost } from "../../../../utils/buildUtils";
import { useTraitRoller } from "../../../../hooks/useTraitRoller"; // Import the hook

export function BuildCategoryView({
	document,
	selectedIds,
	stats,
	hasRolledAge,
	onToggle,
}: {
	document: Document;
	selectedIds: Set<number>;
	stats: BuildStats;
	hasRolledAge: boolean;
	onToggle: (id: number, cat: TraitCategory, isMod: boolean) => void;
}) {
	// Consume the hook instead of managing state locally
	const { rollingCategory, rollingName, wildcardWins, triggerRoll } = useTraitRoller(onToggle);

	const getTraitCost = (traitId: number) => {
		const data = stats.traitMap.get(traitId);
		if (!data) return 0;
		return calculateTraitCost(data.trait.cost, data.trait.discounts_received, selectedIds);
	};

	return (
		<>
			{document.categories.map((cat) => {
				const isRandom = cat.is_random;
				const bypassTraitId = cat.bypass_trait_id;
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
												onClick={() => triggerRoll(cat)} // Use hook function
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
								
									{cat.traits.map((trait) => {
										if (trait.id === cat.free_pick_trait_id && (hasWonWildcard || isBypassed)) {
											return null;
										}

										if (trait.id === bypassTraitId && (hasWonWildcard || hasRolled)) {
											return null;
										}
										
										if (hasRolledAge && trait.id === document.age_bypass_trait_id) {
											return null;
										}

										const isLockedNonModifier = isRandom && !isBypassed && !hasWonWildcard && !trait.is_modifier;
										const isBypassLocked = hasRolled && trait.id === bypassTraitId;
										const isLocked = isLockedNonModifier || isBypassLocked;

										return (
											<BuildTraitCard
												key={trait.id}
												trait={trait}
												category={cat}
												isSelected={selectedIds.has(trait.id)}
												isLocked={isLocked}
												selectedIds={selectedIds}
												getTraitName={(id) => stats.traitMap.get(id)?.trait.name || "Unknown"}
												onToggle={() => {
													if (isLocked) return;
													onToggle(trait.id, cat, trait.is_modifier);
												}}
											/>
										);
									})}
								</div>
							)}
						</div>
					</TabsContent>
				);
			})}
		</>
	);
}