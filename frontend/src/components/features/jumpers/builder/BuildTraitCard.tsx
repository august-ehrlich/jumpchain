import type { Trait, TraitCategory } from "../../../../types/document";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Check, Lock } from "lucide-react";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";

interface BuildTraitCardProps {
	trait: Trait;
	category: TraitCategory;
	isSelected: boolean;
	isLocked?: boolean; 
	finalCost: number;
	onToggle: () => void;
}

export function BuildTraitCard({
	trait,
	category,
	isSelected,
	isLocked = false,
	finalCost,
	onToggle,
}: BuildTraitCardProps) {
	
	const isDiscounted = trait.cost > 0 && finalCost < trait.cost;

	return (
		<Card
			className={`transition-all relative overflow-hidden ${
				isSelected ? "ring-2 ring-primary border-primary shadow-md bg-primary/5" : ""
			} ${
				isLocked && !isSelected ? "opacity-60 grayscale-[50%] cursor-not-allowed" : ""
			} ${
				!isLocked ? "cursor-pointer hover:border-primary/50" : "cursor-default"
			}`}
			onClick={() => !isLocked && onToggle()}
		>
			<CardHeader className="py-3 flex flex-row items-start justify-between space-y-0 relative">
				<div className="pr-12">
					<CardTitle className="text-base flex items-center gap-2">
						{trait.name}
						{trait.is_modifier && (
							<Badge variant="secondary" className="text-[10px]">
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

				<div className="flex items-center justify-end gap-3 shrink-0">
					<div className="flex items-center gap-2">
						{isDiscounted && (
							<span className="text-xs line-through text-muted-foreground">
								{trait.cost}
							</span>
						)}
						<Badge
							variant={trait.cost < 0 ? "default" : "outline"}
							className={trait.cost < 0 ? "bg-primary" : ""}
						>
							{finalCost === 0
								? "Free"
								: trait.cost < 0
									? `+${Math.abs(finalCost)} CP`
									: `-${finalCost} CP`}
						</Badge>
					</div>
					<div className="w-5 h-5 flex items-center justify-center">
						{isSelected && (
							isLocked ? <Lock size={18} className="text-primary" /> : <Check size={20} className="stroke-[3px] text-primary" />
						)}
						{isLocked && !isSelected && <Lock size={16} className="text-muted-foreground/50" />}
					</div>
				</div>
			</CardHeader>
			<CardContent className="py-3 pt-0 text-sm">
				<MarkdownViewer content={trait.description}/>
			</CardContent>
		</Card>
	);
}