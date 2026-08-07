import { useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";
import type { Trait } from "../../../../schemas/documentSchema";

interface RankedTraitListProps {
	traits: Trait[];
	orderedIds: number[];
	onOrderChange: (newIds: number[]) => void;
}

export function RankedTraitList({ traits, orderedIds, onOrderChange }: RankedTraitListProps) {
	// 1. Initialize the order if the user hasn't interacted with it yet
	useEffect(() => {
		if (orderedIds.length === 0 && traits.length > 0) {
			onOrderChange(traits.map((t) => t.id!));
		}
	}, [traits, orderedIds.length, onOrderChange]);

	// 2. Sort the traits based on the current orderedIds state
	const sortedTraits = [...traits].sort((a, b) => {
		const indexA = orderedIds.indexOf(a.id!);
		const indexB = orderedIds.indexOf(b.id!);
		// Push unranked items to the bottom safely
		return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
	});

	// 3. Handle moving items up and down
	const moveItem = (index: number, direction: "up" | "down") => {
		if (direction === "up" && index === 0) return;
		if (direction === "down" && index === sortedTraits.length - 1) return;

		const newOrder = [...orderedIds];
		const targetIndex = direction === "up" ? index - 1 : index + 1;

		// Swap the IDs
		[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
		onOrderChange(newOrder);
	};

	if (!traits || traits.length === 0) {
		return <p className="text-sm text-muted-foreground text-center py-4">No entries to rank.</p>;
	}

	return (
		<div className="space-y-3 mt-4">
			{sortedTraits.map((trait, index) => (
				<Card key={trait.id} className="flex flex-row overflow-hidden border-border shadow-sm">
					{/* Left Column: Ranking Controls */}
					<div className="flex flex-col items-center justify-center bg-muted/50 p-2 border-r border-border w-16 shrink-0">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							onClick={() => moveItem(index, "up")}
							disabled={index === 0}
						>
							<ChevronUp className="h-5 w-5" />
						</Button>
						
						<span className="font-bold text-lg text-foreground my-1">
							#{index + 1}
						</span>

						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							onClick={() => moveItem(index, "down")}
							disabled={index === sortedTraits.length - 1}
						>
							<ChevronDown className="h-5 w-5" />
						</Button>
					</div>

					<div className="flex-1 min-w-0">
						<CardHeader className="py-3 flex flex-row items-start justify-between space-y-0 pr-4">
							<div>
								<CardTitle className="text-base flex items-center gap-2">
									{trait.name}
									{trait.is_modifier && (
										<Badge className="h-5 px-2 text-[10px] uppercase tracking-wider font-semibold bg-primary-foreground text-white">
											Modifier
										</Badge>
									)}
								</CardTitle>
								{trait.subtitle && (
									<p className="text-sm text-muted-foreground italic mt-0.5">
										{trait.subtitle}
									</p>
								)}
							</div>
						</CardHeader>
						<CardContent className="py-3 pt-0 text-sm text-muted-foreground pr-4">
							<MarkdownViewer content={trait.description} />
						</CardContent>
					</div>
				</Card>
			))}
		</div>
	);
}