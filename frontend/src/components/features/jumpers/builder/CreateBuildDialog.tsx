import { useState, useMemo } from "react";
import type { Document, TraitCategory } from "../../../../types/document";
import type { Build } from "../../../../types/jumper";
import { jumperApi } from "../../../../api/jumpers";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Tabs } from "../../../ui/tabs";
import { BuildSidebar } from "./BuildSidebar";
import { BuildCategoryView } from "./BuildCategoryView";

// --- Main Component ---
interface Props {
	jumperId: number;
	document: Document;
	buildToEdit?: Build;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreateBuildDialog({
	jumperId,
	document,
	buildToEdit,
	onOpenChange,
	onSuccess,
}: Props) {
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		new Set(buildToEdit?.traits.map((t) => t.id) || []),
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Math and Validation State
	const stats = useMemo(() => {
		let spentCp = 0;
		const catCounts: Record<number, number> = {};
		const traitMap = new Map();

		document.categories.forEach((c) => {
			c.traits.forEach((t) => {traitMap.set(t.id, { trait: t, catId: c.id })});
		});

		selectedIds.forEach((id) => {
			const data = traitMap.get(id);
			if (!data) return;

			if (!data.trait.is_modifier)
				catCounts[data.catId] = (catCounts[data.catId] || 0) + 1;

			if (data.trait.cost < 0) {
				spentCp += data.trait.cost;
			} else {
				let currentCost = data.trait.cost;
				data.trait.discounts_received.forEach(
					(d: { source_trait_id: number; discount: number }) => {
						if (selectedIds.has(d.source_trait_id))
							currentCost *= 1 - d.discount / 100;
					},
				);
				spentCp += Math.round(currentCost);
			}
		});

		return {
			remainingCp: document.choice_points - spentCp,
			catCounts,
			traitMap,
		};
	}, [selectedIds, document]);

	const toggleTrait = (
		traitId: number,
		category: TraitCategory,
		isModifier: boolean,
	) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(traitId)) {
			newSelected.delete(traitId);
		} else {
			if (
				!isModifier &&
				category.max_allowed !== -1 &&
				(stats.catCounts[category.id] || 0) >= category.max_allowed
			) {
				return toast.error(
					`You can only pick ${category.max_allowed} from ${category.name}`,
				);
			}
			newSelected.add(traitId);
		}
		setSelectedIds(newSelected);
	};

	const handleSubmit = async () => {
		if (stats.remainingCp < 0) return toast.error("You don't have enough CP!");
		setIsSubmitting(true);
		try {
			if (buildToEdit)
				await jumperApi.updateBuild(
					jumperId,
					buildToEdit.id,
					Array.from(selectedIds),
				);
			else
				await jumperApi.createBuild(
					jumperId,
					document.id,
					Array.from(selectedIds),
				);

			toast.success(buildToEdit ? "Build updated!" : "Build saved!");
			onSuccess();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[75vw] w-full h-[85vh] p-0 gap-0 overflow-hidden flex flex-row">
				<Tabs
					defaultValue={document.categories[0]?.id.toString()}
					orientation="vertical"
					className="flex w-full h-full"
				>
					<BuildSidebar
						document={document}
						stats={stats}
						isEditing={!!buildToEdit}
					/>

					<div className="flex-1 flex flex-col h-full relative bg-background">
						<BuildCategoryView
							document={document}
							selectedIds={selectedIds}
							stats={stats}
							onToggle={toggleTrait}
						/>

						{/* Fixed Action Footer */}
						<div className="absolute bottom-0 right-0 left-0 bg-background/80 backdrop-blur-sm border-t p-4 flex justify-end gap-3 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
							<Button
								variant="outline"
								size="lg"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								size="lg"
								onClick={handleSubmit}
								disabled={isSubmitting || stats.remainingCp < 0}
								className="min-w-[150px]"
							>
								{isSubmitting
									? "Saving..."
									: buildToEdit
										? "Update Build"
										: "Lock in Build"}
							</Button>
						</div>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
