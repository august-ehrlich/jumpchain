import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "../../../ui/button";
import { X, Plus, Percent } from "lucide-react";
import type { DocumentFormData } from "../../../../schemas/documentSchema";

export function TraitDiscounts({ 
	categoryIndex, 
	traitIndex 
}: { 
	categoryIndex: number; 
	traitIndex: number;
}) {
	const { control, getValues, register } = useFormContext<DocumentFormData>();
	
	const { fields, append, remove } = useFieldArray({
		control,
		name: `categories.${categoryIndex}.traits.${traitIndex}._visual_discounts` as any,
	});

	const categories = getValues("categories") || [];

	if (fields.length === 0) {
		return (
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="text-xs h-7 text-muted-foreground mt-2"
				onClick={() => append({ source: "", value: 50 })}
			>
				<Plus className="h-3 w-3 mr-1" /> Add Discount
			</Button>
		);
	}

	return (
		<div className="mt-4 space-y-2 border-t pt-3">
			<span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
				<Percent className="h-3 w-3" /> Received Discounts
			</span>
			
			{fields.map((field, idx) => (
				<div key={field.id} className="flex items-center gap-2">
					<select
						{...register(`categories.${categoryIndex}.traits.${traitIndex}._visual_discounts.${idx}.source` as any)}
						className="flex-1 h-8 text-xs rounded-md border border-input bg-background px-3 py-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="">Select source trait...</option>
						{categories.map((cat: any) => (
							<optgroup key={cat.id || cat.name} label={cat.name || "Unnamed Category"}>
								{cat.traits?.map((t: any) => (
									t.name && <option key={t.id} value={t.id}>{t.name}</option>
								))}
							</optgroup>
						))}
					</select>

					<div className="relative w-24">
						<input
							type="number"
							min="1"
							max="100"
							{...register(`categories.${categoryIndex}.traits.${traitIndex}._visual_discounts.${idx}.value` as any, { valueAsNumber: true })}
							className="w-full h-8 text-xs rounded-md border border-input bg-background pl-3 pr-6 py-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
						<span className="absolute right-2 top-1.5 text-xs text-muted-foreground font-medium">%</span>
					</div>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
						onClick={() => remove(idx)}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			))}
			
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="text-xs h-7 text-muted-foreground mt-1"
				onClick={() => append({ source: "", value: 50 })}
			>
				<Plus className="h-3 w-3 mr-1" /> Add Another
			</Button>
		</div>
	);
}