import { useState } from "react";
import type { Document, TraitCategory } from "../../../../types/document";
import type { Build, Jumper } from "../../../../types/jumper";
import { jumperApi } from "../../../../api/jumpers";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Tabs } from "../../../ui/tabs";
import { BuildSidebar } from "./BuildSidebar";
import { BuildCategoryView } from "./BuildCategoryView";
import { BuildTopBar } from "./BuildTopBar";
import { useBuildEditor } from "../../../../hooks/useBuildEditor"; // Import the hook
import { calculateTraitCost } from "../../../../utils/buildUtils";

interface Props {
	jumper: Jumper;
	document: Document;
	buildToEdit?: Build;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreateBuildDialog({
	jumper,
	document,
	buildToEdit,
	onOpenChange,
	onSuccess,
}: Props) {
	const {
		selectedIds,
		buildAge,
		setBuildAge,
		buildGender,
		setBuildGender,
		hasRolledAge,
		setHasRolledAge,
		stats,
		toggleTrait,
	} = useBuildEditor(jumper, document, buildToEdit);

	const [isRollingAge, setIsRollingAge] = useState(false);
	const [rollingAgeVal, setRollingAgeVal] = useState<number>(document.age_roll_min);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const bypassAgeId = document.age_bypass_trait_id;
	const hasAgeBypass = bypassAgeId != null && selectedIds.has(bypassAgeId);
	const numAge = parseInt(buildAge, 10);
	const isAgeOutOfBounds = document.has_random_age && buildAge !== "" && (numAge < document.age_roll_min || numAge > document.age_roll_max);

	const genderBypassId = document.gender_bypass_trait_id;
	const canPickGender = genderBypassId != null && selectedIds.has(genderBypassId);

	const getTraitCost = (traitId: number) => {
		const data = stats.traitMap.get(traitId);
		if (!data) return 0;
		return calculateTraitCost(data.trait.cost, data.trait.discounts_received, selectedIds);
	};

	const handleBuyAgeBypass = () => {
		if (!bypassAgeId) return;
		const data = stats.traitMap.get(bypassAgeId);
		if (!data) return;
		const category = document.categories.find(c => c.id === data.catId);
		if (category) toggleTrait(bypassAgeId, category, data.trait.is_modifier);
	};

	const handleBuyGenderBypass = () => {
		if (!genderBypassId) return;
		const data = stats.traitMap.get(genderBypassId);
		if (!data) return;
		const category = document.categories.find(c => c.id === data.catId);
		if (category) toggleTrait(genderBypassId, category, data.trait.is_modifier);
	};

	const handleRollAge = () => {
		setIsRollingAge(true);
		let counter = 0;
		const min = document.age_roll_min;
		const max = document.age_roll_max;
		
		const interval = setInterval(() => {
			setRollingAgeVal(Math.floor(Math.random() * (max - min + 1)) + min);
			counter++;
			if (counter > 25) {
				clearInterval(interval);
				const finalAge = Math.floor(Math.random() * (max - min + 1)) + min;
				setRollingAgeVal(finalAge);
				setTimeout(() => {
					setBuildAge(finalAge.toString());
					setHasRolledAge(true);
					setIsRollingAge(false);
				}, 500);
			}
		}, 40);
	};

	const handleSubmit = async () => {
		if (stats.remainingCp < 0) return toast.error("You don't have enough CP!");
		
		if (document.has_random_age) {
			if (!hasRolledAge && !hasAgeBypass) {
				return toast.error("You must roll or bypass your age before locking in!");
			}
			if (hasAgeBypass) {
				if (numAge < document.age_roll_min || numAge > document.age_roll_max) {
					return toast.error(`Age must be between ${document.age_roll_min} and ${document.age_roll_max}.`);
				}
			}
		}

		setIsSubmitting(true);
		try {
			const finalAge = buildAge ? parseInt(buildAge, 10) : jumper.age;
			const finalGender = canPickGender ? buildGender : jumper.gender;
			
			if (buildToEdit)
				await jumperApi.updateBuild(jumper.id, buildToEdit.id, Array.from(selectedIds), finalAge, finalGender);
			else
				await jumperApi.createBuild(jumper.id, document.id, Array.from(selectedIds), finalAge, finalGender);

			toast.success(buildToEdit ? "Build updated!" : "Build saved!");
			onSuccess();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[80vw] w-full h-[90vh] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
				
				<BuildTopBar
					document={document}
					isEditing={!!buildToEdit}
					stats={stats}
					buildAge={buildAge}
					setBuildAge={setBuildAge}
					hasRolledAge={hasRolledAge}
					isRollingAge={isRollingAge}
					rollingAgeVal={rollingAgeVal}
					onRollAge={handleRollAge}
					hasAgeBypass={hasAgeBypass}
					isAgeOutOfBounds={!!isAgeOutOfBounds}
					bypassAgeId={bypassAgeId}
					onBuyAgeBypass={handleBuyAgeBypass}
					buildGender={buildGender}
					setBuildGender={setBuildGender}
					canPickGender={canPickGender}
					genderBypassId={genderBypassId}
					onBuyGenderBypass={handleBuyGenderBypass}
					onClose={() => onOpenChange(false)}
					getTraitCost={getTraitCost}
				/>

				<Tabs defaultValue={document.categories[0]?.id.toString()} orientation="vertical" className="flex-1 flex overflow-hidden">
					<BuildSidebar document={document} stats={stats} />

					<div className="flex-1 flex flex-col h-full relative bg-background">
						<BuildCategoryView
							document={document}
							selectedIds={selectedIds}
							stats={stats}
							hasRolledAge={hasRolledAge}
							onToggle={toggleTrait}
						/>

						<div className="absolute bottom-0 right-0 left-0 bg-background/80 backdrop-blur-sm border-t p-4 flex justify-end gap-3 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
							<Button size="lg" onClick={handleSubmit} disabled={isSubmitting || stats.remainingCp < 0} className="min-w-[150px]">
								{isSubmitting ? "Saving..." : buildToEdit ? "Update Build" : "Lock in Build"}
							</Button>
						</div>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}