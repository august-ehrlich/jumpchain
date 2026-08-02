import { useState, useEffect } from "react";
import type { Document } from "../../../../types/document";
import type { Build, Jumper } from "../../../../types/jumper";
import { jumperApi } from "../../../../api/jumpers";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Tabs } from "../../../ui/tabs";
import { BuildSidebar } from "./BuildSidebar";
import { BuildCategoryView } from "./BuildCategoryView";
import { BuildTopBar } from "./BuildTopBar";
import { useBuildStore } from "../../../../stores/useBuildStore"; // Switched from useBuildEditor

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
	// Pull everything from our Rule-Engine powered Zustand store
	const {
		initBuild,
		clearBuild,
		selectedIds,
		buildAge,
		setBuildAge,
		buildGender,
		hasRolledAge,
		setHasRolledAge,
		stats,
		toggleTrait,
	} = useBuildStore();

	// Initialize the store when the dialog opens
	useEffect(() => {
		initBuild(jumper, document, buildToEdit);
		return () => clearBuild();
	}, [initBuild, clearBuild, jumper, document, buildToEdit]);

	const [isRollingAge, setIsRollingAge] = useState(false);
	const [rollingAgeVal, setRollingAgeVal] = useState<number>(document.age_roll_min);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Read bypasses from the engine output
	const hasAgeBypass = stats?.bypassAgeRoll;
	const canPickGender = stats?.bypassGenderLock;
	const numAge = parseInt(buildAge, 10);

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
		if (!stats) return;
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

	const [categoryOrders, setCategoryOrders] = useState<Record<number, number[]>>({});

	const handleOrderChange = (categoryId: number, newIds: number[]) => {
		setCategoryOrders(prev => ({
			...prev,
			[categoryId]: newIds
		}));
	};
	// Don't render until the store has initialized the document and stats
	if (!stats || !useBuildStore.getState().document) return null;

	return (
		<Dialog open={true} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[80vw] w-full h-[90vh] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
				
				{/* Drastically simplified props since TopBar now reads the store directly */}
				<BuildTopBar
					onClose={() => onOpenChange(false)}
					onRollAge={handleRollAge}
					isRollingAge={isRollingAge}
					rollingAgeVal={rollingAgeVal}
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
							categoryOrders={categoryOrders}
    						onOrderChange={handleOrderChange}
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