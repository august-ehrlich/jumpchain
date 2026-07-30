import { Textarea } from "#components/ui/textarea";
import type { TraitCategory } from "../../../../types/document";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
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
			traits: [],
		};
		onChange([...categories, newCategory]);
	};

	const updateCategory = (
		index: number,
		field: keyof TraitCategory,
		value: string | boolean | number,
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
					<div className="flex items-center gap-3 w-full">
						<Input
							placeholder="Category Name (e.g., Powers)"
							value={cat.name}
							onChange={(e) => updateCategory(idx, "name", e.target.value)}
							className="flex-1"
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
								className="w-24"
							/>
						</label>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-destructive h-8 w-8 shrink-0"
							onClick={() => removeCategory(idx)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
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
