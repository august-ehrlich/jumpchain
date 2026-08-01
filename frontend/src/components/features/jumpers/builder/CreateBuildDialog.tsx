import { useState, useMemo } from "react";
import type { Document, TraitCategory, Trait, Discount } from "../../../../types/document";
import type { Build, Jumper } from "../../../../types/jumper";
import { jumperApi } from "../../../../api/jumpers";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Tabs } from "../../../ui/tabs";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { X, Dices, AlertTriangle } from "lucide-react";
import { BuildSidebar } from "./BuildSidebar";
import { BuildCategoryView } from "./BuildCategoryView";

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
	
	// Roller state moved here from the sidebar
	const [isRollingAge, setIsRollingAge] = useState(false);
	const [rollingAgeVal, setRollingAgeVal] = useState<number>(document.age_roll_min);

	const [isSubmitting, setIsSubmitting] = useState(false);

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
				data.trait.discounts_received.forEach((d : Discount) => {
					if (selectedIds.has(d.source_trait_id)) currentCost *= 1 - d.discount / 100;
				});
				spentCp += Math.round(currentCost);
			}
		});

		return { remainingCp: document.choice_points - spentCp, catCounts, traitMap };
	}, [selectedIds, document]);

	// Helpers for the Top Bar UI rules
	const hasAgeBypass = bypassAgeId != null && selectedIds.has(bypassAgeId);
	const canPickAge = !document.has_random_age || hasAgeBypass;
	const numAge = parseInt(buildAge, 10);
	const isAgeOutOfBounds = document.has_random_age && buildAge !== "" && (numAge < document.age_roll_min || numAge > document.age_roll_max);

	const genderBypassId = document.gender_bypass_trait_id;
	const canPickGender = genderBypassId != null && selectedIds.has(genderBypassId);

	const getTraitCost = (traitId: number) => {
		const data = stats.traitMap.get(traitId);
		if (!data) return 0;
		let currentCost = data.trait.cost;
		data.trait.discounts_received.forEach((d : Discount) => {
			if (selectedIds.has(d.source_trait_id)) currentCost *= 1 - (d.discount / 100);
		});
		return Math.round(currentCost);
	};

	const toggleTrait = (traitId: number, category: TraitCategory, isModifier: boolean) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(traitId)) {
			newSelected.delete(traitId);
		} else {
			if (!isModifier && category.max_allowed !== -1 && (stats.catCounts[category.id] || 0) >= category.max_allowed) {
				return toast.error(`You can only pick ${category.max_allowed} from ${category.name}`);
			}
			newSelected.add(traitId);
		}
		setSelectedIds(newSelected);
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
				
				{/* --- NEW HORIZONTAL TOP BAR --- */}
				<div className="flex items-center justify-between px-6 py-4 border-b bg-background shadow-sm z-20 shrink-0 gap-6 overflow-x-auto">
					
					<div className="flex items-center gap-6 shrink-0">
						<div className="min-w-[150px] max-w-[250px] xl:max-w-[350px]">
							<h2 className="text-xl font-bold tracking-tight line-clamp-1">
								{document.title}
							</h2>
							<p className="text-xs text-muted-foreground">
								{buildToEdit ? "Modifying Build" : "Forging New Build"}
							</p>
						</div>
						
						<div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl border">
							<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CP</span>
							<span className={`text-2xl font-black leading-none ${stats.remainingCp < 0 ? "text-destructive" : "text-primary"}`}>
								{stats.remainingCp}
							</span>
						</div>
					</div>

					<div className="flex items-center gap-8">
						{/* Age Top Bar Block */}
						<div className="flex items-center gap-3 border-r pr-8">
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</Label>
							{!document.has_random_age ? (
								<Input type="number" value={buildAge} onChange={(e) => setBuildAge(e.target.value)} className="w-20 text-center font-bold h-9" />
							) : hasAgeBypass ? (
								<div className="relative">
									<Input type="number" value={buildAge} onChange={(e) => setBuildAge(e.target.value)} className={`w-20 text-center font-bold h-9 ${isAgeOutOfBounds ? 'border-destructive text-destructive' : ''}`} />
									{isAgeOutOfBounds && (
										<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-destructive font-semibold whitespace-nowrap flex items-center gap-1">
											<AlertTriangle size={10} /> {document.age_roll_min}-{document.age_roll_max}
										</span>
									)}
								</div>
							) : hasRolledAge ? (
								<div className="w-16 text-center font-black text-lg h-9 bg-primary/10 text-primary flex items-center justify-center rounded-md border border-primary/20 shadow-inner">
									{buildAge}
								</div>
							) : (
								<div className="flex items-center gap-2">
									{isRollingAge ? (
										<span className="w-20 text-center font-black text-lg h-9 bg-primary/20 text-primary flex items-center justify-center rounded-md animate-pulse">
											{rollingAgeVal}
										</span>
									) : (
										<Button onClick={handleRollAge} size="sm" className="h-9 gap-1.5"><Dices size={14} /> Roll</Button>
									)}
									{bypassAgeId && stats.traitMap.has(bypassAgeId) && !isRollingAge && (
										<Button onClick={handleBuyAgeBypass} variant="outline" size="sm" className="h-9">
											Bypass ({getTraitCost(bypassAgeId)} CP)
										</Button>
									)}
								</div>
							)}
						</div>

						{/* Gender Top Bar Block */}
						<div className="flex items-center gap-3">
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</Label>
							{canPickGender ? (
								<Input type="text" value={buildGender} onChange={(e) => setBuildGender(e.target.value)} className="w-28 text-center font-bold h-9" placeholder="Gender" />
							) : (
								<div className="flex items-center gap-2">
									<div className="px-4 min-w-[5rem] text-center font-bold text-sm h-9 bg-muted/10 text-muted-foreground flex items-center justify-center rounded-md border shadow-inner">
										{buildGender}
									</div>
									{genderBypassId && stats.traitMap.has(genderBypassId) && (
										<Button onClick={handleBuyGenderBypass} variant="outline" size="sm" className="h-9">
											Unlock ({getTraitCost(genderBypassId)} CP)
										</Button>
									)}
								</div>
							)}
						</div>
					</div>

					<Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
						<X size={24} />
					</Button>
				</div>
				{/* --- END TOP BAR --- */}

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