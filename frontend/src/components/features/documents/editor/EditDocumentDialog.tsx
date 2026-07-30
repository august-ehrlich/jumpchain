import { useState, useEffect } from "react";
import type { Document, Trait } from "../../../../types/document";
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
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { TraitEditor } from "./TraitEditor";
import { CategoryManager } from "./CategoryManager";

interface EditDialogProps {
	doc: Document | null;
	onOpenChange: (open: boolean) => void;
	onSuccess: (updated: Document) => void;
}

export function EditDocumentDialog({
	doc,
	onOpenChange,
	onSuccess,
}: EditDialogProps) {
	const [formData, setFormData] = useState<Document | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (doc) setFormData(doc);
	}, [doc]);

	if (!formData || !doc) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const updated = await documentApi.update(doc.id, formData);
			onSuccess(updated);
			toast.success(`Jump updated successfully!`);
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateCategoryTraits = (index: number, newTraits: Trait[]) => {
		const newCategories = [...formData.categories];
		newCategories[index].traits = newTraits;
		setFormData({ ...formData, categories: newCategories });
	};

	return (
		<Dialog open={!!doc} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl h-[85vh] flex flex-col mt-4">
				<DialogHeader>
					<DialogTitle>Edit Jump: {formData.title}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
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
							{formData.categories.map((cat) => (
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
							<TabsContent
								value="basics"
								className="space-y-4 m-0 overflow-y-auto h-full pr-2"
							>
								<div className="space-y-2">
									<Label>Title</Label>
									<Input
										required
										value={formData.title}
										onChange={(e) =>
											setFormData({ ...formData, title: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Starting CP</Label>
									<Input
										type="number"
										required
										value={formData.choice_points}
										onChange={(e) =>
											setFormData({
												...formData,
												choice_points: parseInt(e.target.value, 10) || 0,
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Summary</Label>
									<Textarea
										required
										rows={4}
										value={formData.summary}
										onChange={(e) =>
											setFormData({ ...formData, summary: e.target.value })
										}
									/>
								</div>

								<CategoryManager
									categories={formData.categories}
									onChange={(newCategories) =>
										setFormData({ ...formData, categories: newCategories })
									}
								/>
							</TabsContent>

							{formData.categories.map((cat, idx) => (
								<TabsContent
									key={cat.id}
									value={cat.id.toString()}
									className="m-0 h-full overflow-y-auto pr-2"
								>
									<TraitEditor
										traitName={cat.name}
										items={cat.traits}
										onChange={(newTraits) =>
											updateCategoryTraits(idx, newTraits)
										}
										hasCost={cat.has_cost}
										allCategories={formData.categories}
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
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</Tabs>
				</form>
			</DialogContent>
		</Dialog>
	);
}
