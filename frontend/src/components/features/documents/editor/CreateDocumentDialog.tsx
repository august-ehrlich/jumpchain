import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentApi } from "../../../../api/documents";
import { documentSchema, type DocumentFormData } from "../../../../schemas/documentSchema";
import { defaultDocumentState } from "../../../../constants/document";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { CategoryManager } from "./CategoryManager";
import { DocumentBasicsForm } from "./DocumentBasicsForm";

export function CreateDocumentDialog({ isOpen, onOpenChange, onSuccess }: any) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const methods = useForm<DocumentFormData>({
		resolver: zodResolver(documentSchema),
		defaultValues: defaultDocumentState,
		mode: "onChange",
	});

	const onSubmit = async (data: DocumentFormData) => {
		setIsSubmitting(true);
		try {
			const created = await documentApi.create(data as any);
			onSuccess(created);
			toast.success(`Jump "${created.title}" created successfully!`);
			methods.reset(defaultDocumentState); // Reset form
			onOpenChange(false);
		} catch (err) {
			console.error(err);
			toast.error("Failed to create document.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Jump</DialogTitle>
				</DialogHeader>
				
				{/* 3. Wrap everything in FormProvider */}
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5 py-4">
						
						{/* Notice how these take no props now! */}
						<DocumentBasicsForm />
						<CategoryManager />

						<DialogFooter className="pt-6">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || !methods.formState.isValid}>
								{isSubmitting ? "Creating..." : "Create Jump"}
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}