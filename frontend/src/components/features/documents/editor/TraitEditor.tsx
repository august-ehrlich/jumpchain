import { memo, useState, useEffect } from "react";
import { useFormContext, useFieldArray, type UseFormRegister } from "react-hook-form";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "../../../ui/card";
import type { DocumentFormData } from "../../../../schemas/documentSchema";
import { TraitDiscounts } from "./TraitDiscounts";

const TraitFormCard = memo(({ 
	categoryIndex, 
	idx,  
	removeFn,
	register 
}: { 
	categoryIndex: number; 
	idx: number; 
	removeFn: (index: number) => void;
	register: UseFormRegister<DocumentFormData>;
}) => {
	return (
		<Card className="relative pt-4 shadow-sm border-border">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
				onClick={() => removeFn(idx)}
			>
				<Trash2 className="h-4 w-4" />
			</Button>

			<CardContent className="space-y-3">
				<div className="flex gap-4 pr-10">
					<Input
						placeholder="Name"
						{...register(`categories.${categoryIndex}.traits.${idx}.name` as const)}
						className="flex-1 font-semibold"
					/>
					<Input
						placeholder="Subtitle (Optional)"
						{...register(`categories.${categoryIndex}.traits.${idx}.subtitle` as const)}
						className="flex-1"
					/>
					<Input
						type="number"
						placeholder="Cost"
						{...register(`categories.${categoryIndex}.traits.${idx}.cost` as const, {
							valueAsNumber: true,
						})}
						className="w-24"
					/>
					<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
						<input
							type="checkbox"
							{...register(`categories.${categoryIndex}.traits.${idx}.is_modifier` as const)}
							className="w-4 h-4 accent-primary rounded border-input"
						/>
						Modifier Trait?
					</label>
				</div>

				<Textarea
					placeholder="Description"
					{...register(`categories.${categoryIndex}.traits.${idx}.description` as const)}
					rows={2}
				/>
				<TraitDiscounts categoryIndex={categoryIndex} traitIndex={idx} />
			</CardContent>
		</Card>
	);
});
TraitFormCard.displayName = "TraitFormCard";

interface TraitEditorProps {
	categoryIndex: number;
	traitName: string;
}

export function TraitEditor({ categoryIndex, traitName }: TraitEditorProps) {
	const { control, register } = useFormContext<DocumentFormData>();
	
	const { fields, append, remove } = useFieldArray({
		control,
		name: `categories.${categoryIndex}.traits` as const,
	});

	const [visibleCount, setVisibleCount] = useState(5);

	useEffect(() => {
		if (visibleCount < fields.length) {
			const timer = setTimeout(() => {
				setVisibleCount((prev) => Math.min(prev + 5, fields.length));
			}, 30);
			return () => clearTimeout(timer);
		}
	}, [visibleCount, fields.length]);

	return (
		<div className="space-y-4 pb-4">
			{fields.slice(0, visibleCount).map((field, idx) => (
				<TraitFormCard
					key={field.id}
					categoryIndex={categoryIndex}
					idx={idx}
					removeFn={remove}
					register={register} // Pass it down manually
				/>
			))}
			
			{visibleCount < fields.length && (
				<div className="text-center text-sm text-muted-foreground animate-pulse py-2">
					Loading more items...
				</div>
			)}
			
			<Button
				type="button"
				variant="outline"
				className="w-full border-dashed mt-4"
				onClick={() => {
					append({
						id: -(Date.now() + Math.floor(Math.random() * 10000)),
						name: "",
						description: "",
						cost: 0,
						is_modifier: false,
					});
					setVisibleCount(fields.length + 1);
				}}
			>
				<Plus className="h-4 w-4 mr-2" /> Add {traitName}
			</Button>
		</div>
	);
}