import { Textarea } from "#components/ui/textarea";
import type { TraitCategory } from "../../../../types/document";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Trash2, Plus } from "lucide-react";


interface CategoryManagerProps {
	categories: TraitCategory[];
	onChange: (categories: TraitCategory[]) => void;
}

export function CategoryManager({
	categories,
	onChange,
}: CategoryManagerProps) {
	const addCategory = () => {
		const newCategory: TraitCategory = {
			id: -Date.now(),
			name: "",
			has_cost: true,
			max_allowed: 1,
			is_random: false,
			bypass_trait_id: null,
			traits: [],
		};
		onChange([...categories, newCategory]);
	};

	const updateCategory = (
		index: number,
		field: keyof TraitCategory,
		value: string | boolean | number | null,
	) => {
		const newCategories = [...categories];
		newCategories[index] = { ...newCategories[index], [field]: value };
		onChange(newCategories);
	};

	const removeCategory = (index: number) => {
		const newCategories = [...categories];
		newCategories.splice(index, 1);
		onChange(newCategories);
	};

	return (
		<div className="space-y-3 mt-6 border-t pt-4">
			<Label className="text-base">Manage Categories</Label>
			{categories.map((cat, idx) => (
				<div
					key={cat.id}
					className="flex flex-col gap-3 bg-muted/30 p-2 rounded-md"
				>
					<div className="flex flex-wrap items-center gap-3 w-full">
						<Input
							placeholder="Category Name (e.g., Powers)"
							value={cat.name}
							onChange={(e) => updateCategory(idx, "name", e.target.value)}
							className="flex-1 min-w-[150px]"
						/>
						<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
							Has Cost?
							<input
								type="checkbox"
								checked={cat.has_cost}
								onChange={(e) =>
									updateCategory(idx, "has_cost", e.target.checked)
								}
								className="w-4 h-4 accent-primary"
							/>
						</label>
						<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
							Force Random?
							<input
								type="checkbox"
								checked={cat.is_random || false}
								onChange={(e) => updateCategory(idx, "is_random", e.target.checked)}
								className="w-4 h-4 accent-primary"
							/>
						</label>
						<label htmlFor={`max-allowed-${cat.id}`} className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
							Max Allowed Traits:
							<Input
								type="number"
								placeholder="Max Allowed"
								value={cat.max_allowed}
								onChange={(e) =>
									updateCategory(
										idx,
										"max_allowed",
										parseInt(e.target.value, 10) || 0,
									)
								}
								className="w-20"
							/>
						</label>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-destructive h-8 w-8 shrink-0 ml-auto"
							onClick={() => removeCategory(idx)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>

					{cat.is_random && (
						<div className="flex flex-col gap-2 bg-primary/5 p-3 rounded-md border border-primary/20">
							<div className="flex items-center gap-3">
								<Label className="whitespace-nowrap text-sm text-muted-foreground w-40">Bypass Modifier:</Label>
								<Select
									value={cat.bypass_trait_id?.toString() || "none"}
									onValueChange={(val) => updateCategory(idx, "bypass_trait_id", val === "none" || val === null ? null : parseInt(val, 10))}
								>
									<SelectTrigger className="w-full h-8">
										<SelectValue placeholder="Select a bypass modifier...">
											{cat.bypass_trait_id 
												? (cat.traits.find(t => t.id === cat.bypass_trait_id)?.name || "Unnamed") 
												: "None"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{cat.traits.filter(t => t.is_modifier).map(t => (
											<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center gap-3">
								<Label className="whitespace-nowrap text-sm text-muted-foreground w-40">Wildcard Roll (Free Pick):</Label>
								<Select
									value={cat.free_pick_trait_id?.toString() || "none"}
									onValueChange={(val) => updateCategory(idx, "free_pick_trait_id", val === "none" || val === null ? null : parseInt(val, 10))}
								>
									<SelectTrigger className="w-full h-8">
										<SelectValue placeholder="Select a wildcard outcome...">
											{cat.free_pick_trait_id 
												? (cat.traits.find(t => t.id === cat.free_pick_trait_id)?.name || "Unnamed") 
												: "None"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{cat.traits.filter(t => !t.is_modifier).map(t => (
											<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
					<Textarea
						placeholder="Summary (Optional)"
						value={cat.summary}
						onChange={(e) => updateCategory(idx, "summary", e.target.value)}
						className="w-full"
					/>
				</div>
			))}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={addCategory}
				className="w-full border-dashed"
			>
				<Plus className="h-4 w-4 mr-2" /> Add Category Tab
			</Button>
		</div>
	);
}