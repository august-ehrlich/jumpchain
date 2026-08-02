import { useFormContext, useFieldArray } from "react-hook-form";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Trash2, Plus } from "lucide-react";
import type { DocumentFormData } from "../../../../schemas/documentSchema";

export function CategoryManager() {
	const { register, control, watch } = useFormContext<DocumentFormData>();
	
	const { fields, append, remove } = useFieldArray({
		control,
		name: "categories",
	});

	return (
		<div className="space-y-3 mt-6 border-t pt-4">
			<Label className="text-base">Manage Categories</Label>
			
			{fields.map((field, idx) => {
				return (
					<div key={field.id} className="flex flex-col gap-3 bg-muted/30 p-2 rounded-md">
						<div className="flex flex-wrap items-center gap-3 w-full">
							<Input
								placeholder="Category Name"
								{...register(`categories.${idx}.name` as const)}
								className="flex-1 min-w-[150px]"
							/>
							
							<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
								Force Random?
								<input
									type="checkbox"
									{...register(`categories.${idx}.is_random` as const)}
									className="w-4 h-4 accent-primary"
								/>
							</label>
							<label className="flex items-center gap-2 text-sm cursor-pointer">
								Ordering Mode
								<input
									type="checkbox"
									{...register(`categories.${idx}.is_ordering` as const)}
									className="w-4 h-4 accent-primary rounded border-input"
								/>
							</label>
							<label className="flex items-center gap-2 text-sm whitespace-nowrap">
								Max Allowed:
								<Input
									type="number"
									{...register(`categories.${idx}.max_allowed` as const, { valueAsNumber: true })}
									className="w-20"
								/>
							</label>

							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="text-destructive h-8 w-8 shrink-0 ml-auto"
								onClick={() => remove(idx)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						<Textarea
							placeholder="Summary (Optional)"
							{...register(`categories.${idx}.summary` as const)}
							className="w-full"
						/>
					</div>
				);
			})}
			
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => append({
					id: -Date.now(), name: "", max_allowed: 1,
					is_random: false, traits: [], is_ordering: false
				})}
				className="w-full border-dashed"
			>
				<Plus className="h-4 w-4 mr-2" /> Add Category Tab
			</Button>
		</div>
	);
}