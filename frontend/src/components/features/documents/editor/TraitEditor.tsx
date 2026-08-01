import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { DiscountPicker } from "./DiscountPicker";
import { getTraitNameById } from "../../../../utils/documentUtils";
import type { DocumentFormData } from "../../../../schemas/documentSchema";

interface TraitEditorProps {
	categoryIndex: number;
	traitName: string;
	hasCost: boolean;
}

export function TraitEditor({
	categoryIndex,
	traitName,
	hasCost,
}: TraitEditorProps) {
	const { register, control, watch, setValue } = useFormContext<DocumentFormData>();
	
	const { fields, append, remove } = useFieldArray({
		control,
		name: `categories.${categoryIndex}.traits` as const,
	});

	const allCategories = watch("categories") || [];

	return (
		<div className="space-y-4 pb-4">
			{fields.map((field, idx) => {
				const discounts = watch(`categories.${categoryIndex}.traits.${idx}.discounts_received`) || [];
				const traitId = watch(`categories.${categoryIndex}.traits.${idx}.id`);

				return (
					<Card key={field.id} className="relative pt-4 shadow-sm">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
							onClick={() => remove(idx)}
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
								{hasCost && (
									<Input
										type="number"
										placeholder="Cost"
										{...register(`categories.${categoryIndex}.traits.${idx}.cost` as const, {
											valueAsNumber: true,
										})}
										className="w-24"
									/>
								)}
								<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
									<input
										type="checkbox"
										{...register(`categories.${categoryIndex}.traits.${idx}.is_modifier` as const)}
										className="w-4 h-4 accent-primary"
									/>
									Modifier Trait?
								</label>
							</div>

							<Textarea
								placeholder="Description"
								{...register(`categories.${categoryIndex}.traits.${idx}.description` as const)}
								rows={2}
							/>

							{hasCost && (
								<div className="pt-3 border-t mt-3 space-y-2">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Discounts Received
									</p>

									{discounts.map((discount, dIdx) => (
										<div
											key={discount.source_trait_id}
											className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md"
										>
											<span className="flex-1">
												Discounted by <strong>{getTraitNameById(allCategories, discount.source_trait_id)}</strong>
											</span>
											<Badge variant="secondary">{discount.discount}% off</Badge>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-destructive"
												onClick={() => {
													const newDiscounts = [...discounts];
													newDiscounts.splice(dIdx, 1);
													setValue(
														`categories.${categoryIndex}.traits.${idx}.discounts_received`,
														newDiscounts,
														{ shouldDirty: true }
													);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									))}

									<DiscountPicker
										currentTraitId={traitId}
										allCategories={allCategories}
										onAdd={(sourceId, val) => {
											const newDiscounts = [
												...discounts,
												{ source_trait_id: sourceId, discount: val },
											];
											setValue(
												`categories.${categoryIndex}.traits.${idx}.discounts_received`,
												newDiscounts,
												{ shouldDirty: true }
											);
										}}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				);
			})}
			
			<Button
				type="button"
				variant="outline"
				className="w-full border-dashed"
				onClick={() =>
					append({
						id: -(Date.now() + Math.floor(Math.random() * 10000)),
						name: "",
						description: "",
						cost: 0,
						is_modifier: false,
						discounts_received: [],
					})
				}
			>
				<Plus className="h-4 w-4 mr-2" /> Add {traitName}
			</Button>
		</div>
	);
}