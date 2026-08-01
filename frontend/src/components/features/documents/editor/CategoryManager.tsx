import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
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
				// Watch specific values for this index to drive conditional UI and dropdowns
				const isRandom = watch(`categories.${idx}.is_random`);
				const categoryTraits = watch(`categories.${idx}.traits`) || [];

				return (
					<div key={field.id} className="flex flex-col gap-3 bg-muted/30 p-2 rounded-md">
						<div className="flex flex-wrap items-center gap-3 w-full">
							<Input
								placeholder="Category Name"
								{...register(`categories.${idx}.name` as const)}
								className="flex-1 min-w-[150px]"
							/>
							
							<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
								Has Cost?
								<input
									type="checkbox"
									{...register(`categories.${idx}.has_cost` as const)}
									className="w-4 h-4 accent-primary"
								/>
							</label>
							
							<label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
								Force Random?
								<input
									type="checkbox"
									{...register(`categories.${idx}.is_random` as const)}
									className="w-4 h-4 accent-primary"
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

						{/* Repaired Random Dropdowns using Controller */}
						{isRandom && (
							<div className="flex flex-col gap-2 bg-primary/5 p-3 rounded-md border border-primary/20">
								<div className="flex items-center gap-3">
									<Label className="whitespace-nowrap text-sm text-muted-foreground w-40">Bypass Modifier:</Label>
									<Controller
										control={control}
										name={`categories.${idx}.bypass_trait_id` as const}
										render={({ field }) => (
											<Select
												value={field.value?.toString() || "none"}
												onValueChange={(val) => field.onChange(val === "none" || val === null ? null : parseInt(val, 10))}
											>
												<SelectTrigger className="w-full h-8">
													<SelectValue placeholder="Select a bypass modifier...">
														{field.value
															? (categoryTraits.find((t) => t.id === field.value)?.name || "Unnamed")
															: "None"}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{categoryTraits.filter((t) => t.is_modifier).map((t) => (
														<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</div>

								<div className="flex items-center gap-3">
									<Label className="whitespace-nowrap text-sm text-muted-foreground w-40">Wildcard Roll (Free Pick):</Label>
									<Controller
										control={control}
										name={`categories.${idx}.free_pick_trait_id` as const}
										render={({ field }) => (
											<Select
												value={field.value?.toString() || "none"}
												onValueChange={(val) => field.onChange(val === "none" || val === null ? null : parseInt(val, 10))}
											>
												<SelectTrigger className="w-full h-8">
													<SelectValue placeholder="Select a wildcard outcome...">
														{field.value
															? (categoryTraits.find((t) => t.id === field.value)?.name || "Unnamed")
															: "None"}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{categoryTraits.filter((t) => !t.is_modifier).map((t) => (
														<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</div>
							</div>
						)}

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
					id: -Date.now(), name: "", has_cost: true, max_allowed: 1,
					is_random: false, bypass_trait_id: null, free_pick_trait_id: null, traits: []
				})}
				className="w-full border-dashed"
			>
				<Plus className="h-4 w-4 mr-2" /> Add Category Tab
			</Button>
		</div>
	);
}