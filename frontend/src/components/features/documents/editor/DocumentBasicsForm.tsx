import { useFormContext } from "react-hook-form";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import type { DocumentFormData } from "../../../../schemas/documentSchema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion";
import { RulesJsonEditor } from "./rules/RulesJsonEditor";

export function DocumentBasicsForm() {
	const { register, watch, formState: { errors } } = useFormContext<DocumentFormData>();
	
	const hasRandomAge = watch("has_random_age");

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Title</Label>
				<Input {...register("title")} />
				{errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
			</div>
			
			<div className="space-y-2">
				<Label>Starting Choice Points (CP)</Label>
				<Input type="number" {...register("choice_points", { valueAsNumber: true })} />
				{errors.choice_points && <span className="text-xs text-destructive">{errors.choice_points.message}</span>}
			</div>
			
			<div className="space-y-2">
				<Label>Summary</Label>
				<Textarea rows={4} {...register("summary")} />
				{errors.summary && <span className="text-xs text-destructive">{errors.summary.message}</span>}
			</div>

			<div className="space-y-4 border p-4 rounded-lg bg-muted/10">
				<label className="flex items-center gap-2 font-medium cursor-pointer">
					<input
						type="checkbox"
						{...register("has_random_age")}
						className="accent-primary w-4 h-4"
					/>
					Enforce Random Age Roll?
				</label>

				{hasRandomAge && (
					<div className="pl-6 space-y-4 border-l-2 border-primary/20">
						<div className="flex gap-4">
							<div className="space-y-1.5 flex-1">
								<Label>Min Age</Label>
								<Input type="number" {...register("age_roll_min", { valueAsNumber: true })} />
							</div>
							<div className="space-y-1.5 flex-1">
								<Label>Max Age</Label>
								<Input type="number" {...register("age_roll_max", { valueAsNumber: true })} />
								{/* Zod relational error triggers here */}
								{errors.age_roll_max && <span className="text-xs text-destructive">{errors.age_roll_max.message}</span>}
							</div>
						</div>
					</div>
				)}
			</div>
			<Accordion className="w-full border-t pt-4 mt-6">
				<AccordionItem value="rules" className="border-none">
					<AccordionTrigger className="text-lg font-semibold hover:no-underline">
						Advanced Rules & Logic (JSON)
					</AccordionTrigger>
					<AccordionContent className="pt-4">
						<p className="text-sm text-muted-foreground mb-4">
							Define cross-category interactions, conditional discounts, and bypasses.
						</p>
						<RulesJsonEditor />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}