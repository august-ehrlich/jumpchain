import { useState, useEffect, useTransition } from "react";
import { useForm, FormProvider, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema, type DocumentFormData } from "../../../../schemas/documentSchema";
import type { Document } from "../../../../types/document";
import { documentApi } from "../../../../api/documents";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { TraitEditor } from "./TraitEditor";
import { DocumentBasicsForm } from "./DocumentBasicsForm";
import { CategoryManager } from "./CategoryManager";

interface EditDialogProps {
	doc: Document | null;
	onOpenChange: (open: boolean) => void;
	onSuccess: (updated: Document) => void;
}

export function EditDocumentDialog({ doc, onOpenChange, onSuccess }: EditDialogProps) {
	const [activeTab, setActiveTab] = useState("basics");
	const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["basics"]));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPending, startTransition] = useTransition();

	const methods = useForm<DocumentFormData>({
		resolver: zodResolver(documentSchema),
		defaultValues: doc || undefined,
		mode: "onBlur",
	});

	useEffect(() => {
		if (doc) {
			const processedDoc = JSON.parse(JSON.stringify(doc));
			const advancedRules: any[] = [];
			const visualDiscounts = new Map<number, any[]>();

			(processedDoc.rules || []).forEach((rule: any) => {
				// Catch both the new UI rules and anything matching the Legacy pattern
				const isUiRule = rule.name?.startsWith("UI_DISCOUNT_");
				const isLegacyRule = rule.name?.includes("Legacy Discount");

				if (isUiRule || isLegacyRule) {
					const effect = rule.effects?.find((e: any) => e.type === "MULTIPLY_COST");
					const condition = rule.conditions?.find((c: any) => c.type === "HAS_TRAIT");
					
					if (effect && condition) {
						const targetId = effect.targetId;
						const sourceId = condition.targetId;
						
						const percentage = Math.round((1 - effect.value) * 100);
						
						if (!visualDiscounts.has(targetId)) {
							visualDiscounts.set(targetId, []);
						}
						visualDiscounts.get(targetId)!.push({
							source: sourceId.toString(),
							value: percentage
						});
						
						return;
					}
				}
				
				advancedRules.push(rule);
			});

			processedDoc.categories.forEach((cat: any) => {
				cat.traits.forEach((trait: any) => {
					if (visualDiscounts.has(trait.id)) {
						trait._visual_discounts = visualDiscounts.get(trait.id);
					}
				});
			});

			processedDoc.rules = advancedRules;

			methods.reset(processedDoc);
			setActiveTab("basics");
			setVisitedTabs(new Set(["basics"]));
		}
	}, [doc, methods]);

	const { fields: categoryFields } = useFieldArray({
		control: methods.control,
		name: "categories"
	});

	const handleTabChange = (value: string) => {
		startTransition(() => {
			setActiveTab(value);
			setVisitedTabs((prev) => {
				const next = new Set(prev);
				next.add(value);
				return next;
			});
		});
	};
	if (!doc) return null;
	
	const currentTitle = methods.watch("title");

	const onSubmit: SubmitHandler<DocumentFormData> = async (data) => {
		setIsSubmitting(true);
		
		try {
			const dataToSave = JSON.parse(JSON.stringify(data));
			const generatedUiRules: any[] = [];

			dataToSave.categories.forEach((cat: any) => {
				cat.traits.forEach((trait: any) => {
					if (trait._visual_discounts && trait._visual_discounts.length > 0) {
						trait._visual_discounts.forEach((vd: any) => {
							if (vd.source !== "") {
								const sourceId = parseInt(vd.source, 10);
								const targetId = trait.id;
								
								const multiplier = 1 - (vd.value / 100);
								
								generatedUiRules.push({
									name: `UI_DISCOUNT_${sourceId}_${targetId}`,
									conditions: [{ type: "HAS_TRAIT", targetId: sourceId }],
									effects: [{ type: "MULTIPLY_COST", targetId: targetId, value: multiplier }]
								});
							}
						});
					}
					delete trait._visual_discounts;
				});
			});

			dataToSave.rules = [...(dataToSave.rules || []), ...generatedUiRules];

			const updated = await documentApi.update(doc.id, dataToSave);
			onSuccess(updated);
			toast.success(`Jump updated successfully!`);
			onOpenChange(false);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update document.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={!!doc} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl h-[85vh] flex flex-col mt-4">
				<DialogHeader>
					<DialogTitle>Edit Jump: {currentTitle}</DialogTitle>
				</DialogHeader>

				<FormProvider {...methods}>
					<form 
						onSubmit={methods.handleSubmit(
							onSubmit, 
							(errors) => {
								console.error("Zod Validation Errors:", errors);
								toast.error("Please fix the errors in the form before saving.");
							}
						)} 
						className="flex-1 overflow-hidden flex flex-col mt-4"
					>
						<Tabs 
							defaultValue={"basics"}
							value={activeTab} 
							onValueChange={handleTabChange} 
							className="flex-1 flex flex-col overflow-hidden"
						>
							<TabsList className="w-full flex flex-wrap h-auto justify-start">
								<TabsTrigger value="basics" className="flex-1 min-w-[100px]">
									Basics & Settings
								</TabsTrigger>
								{categoryFields.map((cat: any) => (
									<TabsTrigger key={cat.id} value={cat.id.toString()} className="flex-1 min-w-[100px]">
										{cat.name || "Unnamed"}
									</TabsTrigger>
								))}
							</TabsList>

							<div className="flex-1 overflow-hidden py-4 flex flex-col">
								{/* Basics is always visited, so it always mounts */}
								<TabsContent value="basics" keepMounted className="space-y-4 m-0 overflow-y-auto h-full pr-2">
									<DocumentBasicsForm />
									<CategoryManager />
								</TabsContent>
								{categoryFields.map((cat: any, categoryIndex) => {
									const tabId = cat.id.toString();
									if (!visitedTabs.has(tabId)) return null;

									return (
										<TabsContent
											key={cat.id}
											value={tabId}
											keepMounted
											className="m-0 h-full overflow-y-auto pr-2"
										>
											<TraitEditor
												categoryIndex={categoryIndex}
												traitName={cat.name}
											/>
										</TabsContent>
									);
								})}
							</div>

							<DialogFooter className="pt-4 mt-auto">
								<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						</Tabs>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}