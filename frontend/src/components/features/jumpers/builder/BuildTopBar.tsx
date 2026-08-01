import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { X, Dices, AlertTriangle } from "lucide-react";
import { useBuildStore } from "../../../../stores/useBuildStore";
import { calculateTraitCost } from "../../../../utils/buildUtils";

export function BuildTopBar({ onClose, onRollAge, isRollingAge, rollingAgeVal }: any) {
	const { 
        document, buildToEdit, stats, buildAge, setBuildAge, 
        hasRolledAge, buildGender, setBuildGender, toggleTrait, selectedIds 
    } = useBuildStore();

	if (!document) return null;

	const isEditing = !!buildToEdit;
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

	const onBuyAgeBypass = () => {
		if (!bypassAgeId) return;
		const data = stats.traitMap.get(bypassAgeId);
		if (!data) return;
		const category = document.categories.find(c => c.id === data.catId);
		if (category) toggleTrait(bypassAgeId, category, data.trait.is_modifier);
	};

	const onBuyGenderBypass = () => {
		if (!genderBypassId) return;
		const data = stats.traitMap.get(genderBypassId);
		if (!data) return;
		const category = document.categories.find(c => c.id === data.catId);
		if (category) toggleTrait(genderBypassId, category, data.trait.is_modifier);
	};

	return (
		<div className="flex items-center justify-between px-6 py-4 border-b bg-background shadow-sm z-20 shrink-0 gap-6 overflow-x-auto">
			<div className="flex items-center gap-6 shrink-0">
				<div className="min-w-[150px] max-w-[250px] xl:max-w-[350px]">
					<h2 className="text-xl font-bold tracking-tight line-clamp-1">
						{document.title}
					</h2>
					<p className="text-xs text-muted-foreground">
						{isEditing ? "Modifying Build" : "Forging New Build"}
					</p>
				</div>

				<div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl border">
					<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						CP
					</span>
					<span
						className={`text-2xl font-black leading-none ${stats.remainingCp < 0 ? "text-destructive" : "text-primary"}`}
					>
						{stats.remainingCp}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-8">
				{/* Age Top Bar Block */}
				<div className="flex items-center gap-3 border-r pr-8">
					<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Age
					</Label>
					{!document.has_random_age ? (
						<Input
							type="number"
							value={buildAge}
							onChange={(e) => setBuildAge(e.target.value)}
							className="w-20 text-center font-bold h-9"
						/>
					) : hasAgeBypass ? (
						<div className="relative">
							<Input
								type="number"
								value={buildAge}
								onChange={(e) => setBuildAge(e.target.value)}
								className={`w-20 text-center font-bold h-9 ${isAgeOutOfBounds ? "border-destructive text-destructive" : ""}`}
							/>
							{isAgeOutOfBounds && (
								<span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-destructive font-semibold whitespace-nowrap flex items-center gap-1">
									<AlertTriangle size={10} /> {document.age_roll_min}-
									{document.age_roll_max}
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
								<Button onClick={onRollAge} size="sm" className="h-9 gap-1.5">
									<Dices size={14} /> Roll
								</Button>
							)}
							{bypassAgeId && stats.traitMap.has(bypassAgeId) && !isRollingAge && (
								<Button
									onClick={onBuyAgeBypass}
									variant="outline"
									size="sm"
									className="h-9"
								>
									Bypass ({getTraitCost(bypassAgeId)} CP)
								</Button>
							)}
						</div>
					)}
				</div>

				{/* Gender Top Bar Block */}
				<div className="flex items-center gap-3">
					<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Gender
					</Label>
					{canPickGender ? (
						<Input
							type="text"
							value={buildGender}
							onChange={(e) => setBuildGender(e.target.value)}
							className="w-28 text-center font-bold h-9"
							placeholder="Gender"
						/>
					) : (
						<div className="flex items-center gap-2">
							<div className="px-4 min-w-[5rem] text-center font-bold text-sm h-9 bg-muted/10 text-muted-foreground flex items-center justify-center rounded-md border shadow-inner">
								{buildGender}
							</div>
							{genderBypassId && stats.traitMap.has(genderBypassId) && (
								<Button
									onClick={onBuyGenderBypass}
									variant="outline"
									size="sm"
									className="h-9"
								>
									Unlock ({getTraitCost(genderBypassId)} CP)
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={onClose}
				className="shrink-0 text-muted-foreground hover:text-foreground"
			>
				<X size={24} />
			</Button>
		</div>
	);
}