import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema, type DocumentFormData } from "../../../../schemas/documentSchema";
import type { Document } from "../../../../types/document";
import { documentApi } from "../../../../api/documents";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../../ui/dialog";
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
	const [isSubmitting, setIsSubmitting] = useState(false);

	const methods = useForm<DocumentFormData>({
		resolver: zodResolver(documentSchema),
		defaultValues: doc || undefined,
		mode: "onChange",
	});

	useEffect(() => {
		if (doc) {
			methods.reset(doc);
		}
	}, [doc, methods]);

	if (!doc) return null;

	const currentTitle = methods.watch("title");
	const categories = methods.watch("categories") || [];

	const onSubmit = async (data: DocumentFormData) => {
		setIsSubmitting(true);
		try {

			const updated = await documentApi.update(doc.id, data as any);
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
						onSubmit={methods.handleSubmit(onSubmit)}
						className="flex-1 overflow-hidden flex flex-col mt-4"
					>
						<Tabs
							defaultValue="basics"
							className="flex-1 flex flex-col overflow-hidden"
						>
							<TabsList className="w-full flex flex-wrap h-auto justify-start">
								<TabsTrigger value="basics" className="flex-1 min-w-[100px]">
									Basics & Settings
								</TabsTrigger>
								{categories.map((cat) => (
									<TabsTrigger
										key={cat.id}
										value={cat.id.toString()}
										className="flex-1 min-w-[100px]"
									>
										{cat.name || "Unnamed"}
									</TabsTrigger>
								))}
							</TabsList>

							<div className="flex-1 overflow-hidden py-4 flex flex-col">
								<TabsContent value="basics" className="space-y-4 m-0 overflow-y-auto h-full pr-2">
									<DocumentBasicsForm />
									<CategoryManager />
								</TabsContent>

								{categories.map((cat, categoryIndex) => (
									<TabsContent
										key={cat.id}
										value={cat.id.toString()}
										className="m-0 h-full overflow-y-auto pr-2"
									>
										<TraitEditor
											categoryIndex={categoryIndex}
											traitName={cat.name}
											hasCost={cat.has_cost}
										/>
									</TabsContent>
								))}
							</div>

							<DialogFooter className="pt-4 mt-auto">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting || !methods.formState.isValid}>
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