import { useState } from "react";
import { documentApi } from "../../../../api/documents";
import type { Document, TraitCategory } from "../../../../types/document";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../ui/select"
import { CategoryManager } from "./CategoryManager";

interface CreateDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: (doc: Document) => void;
}

// Pre-load the 4 classic jumpchain categories to save the user time
const defaultCategories: TraitCategory[] = [
	{ id: -1, name: "Origins", has_cost: true, max_allowed: 1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -2, name: "Perks", has_cost: true, max_allowed: -1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -3, name: "Items", has_cost: true, max_allowed: -1, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
	{ id: -4, name: "Drawbacks", has_cost: false, max_allowed: 2, traits: [], is_random: false, bypass_trait_id: null, free_pick_trait_id: null },
];

export function CreateDocumentDialog({
	isOpen,
	onOpenChange,
	onSuccess,
}: CreateDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newDoc, setNewDoc] = useState<Omit<Document, "id">>({
		title: "",
		choice_points: 1000,
		summary: "",
		has_random_age: false,
		age_roll_min: 14,
		age_roll_max: 25,
		age_bypass_trait_id: null,
		gender_bypass_trait_id: null,
		categories: defaultCategories,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const created = await documentApi.create(newDoc);
			onSuccess(created);
			toast.success(`Jump "${created.title}" created successfully!`);
			// Reset form
			setNewDoc({
				title: "",
				choice_points: 1000,
				summary: "",
				has_random_age: false,
				age_roll_min: 14,
				age_roll_max: 25,
				age_bypass_trait_id: null,
				categories: defaultCategories,
			});
		} catch (err) {
			console.error(err);
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
				<form onSubmit={handleSubmit} className="space-y-5 py-4">
					<div className="space-y-2">
						<Label>Title</Label>
						<Input
							required
							value={newDoc.title}
							onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
						/>
					</div>
					<div className="space-y-2">
						<Label>Starting Choice Points (CP)</Label>
						<Input
							type="number"
							required
							value={newDoc.choice_points}
							onChange={(e) =>
								setNewDoc({
									...newDoc,
									choice_points: parseInt(e.target.value, 10) || 0,
								})
							}
						/>
					</div>
					<div className="space-y-2">
						<Label>Summary</Label>
						<Textarea
							required
							rows={3}
							value={newDoc.summary}
							onChange={(e) =>
								setNewDoc({ ...newDoc, summary: e.target.value })
							}
						/>
					</div>
					<div className="space-y-1.5 pt-2">
						<Label>Gender / Alt-Form Bypass Trait (Optional)</Label>
						<Select
							value={newDoc.gender_bypass_trait_id?.toString() || "none"}
							onValueChange={(val) => setNewDoc({ ...newDoc, gender_bypass_trait_id: val === "none" || val === null ? null : parseInt(val, 10) })}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a trait to allow changing gender...">
									{newDoc.gender_bypass_trait_id 
										? newDoc.categories.flatMap((c) => c.traits).find((t) => t.id === newDoc.gender_bypass_trait_id)?.name || "Unnamed" 
										: "None"}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								{newDoc.categories.flatMap((c) => c.traits).map((t) => (
									<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
						<div className="space-y-4 border p-4 rounded-lg bg-muted/10">
							<label className="flex items-center gap-2 font-medium cursor-pointer">
								<input
									type="checkbox"
									checked={newDoc.has_random_age}
									onChange={(e) => setNewDoc({ ...newDoc, has_random_age: e.target.checked })}
									className="accent-primary w-4 h-4"
								/>
								Enforce Random Age Roll?
							</label>
							
							{newDoc.has_random_age && (
								<div className="pl-6 space-y-4 border-l-2 border-primary/20">
									<div className="flex gap-4">
										<div className="space-y-1.5 flex-1">
											<Label>Min Age</Label>
											<Input
												type="number"
												value={newDoc.age_roll_min}
												onChange={(e) => setNewDoc({ ...newDoc, age_roll_min: parseInt(e.target.value, 10) || 0 })}
											/>
										</div>
										<div className="space-y-1.5 flex-1">
											<Label>Max Age</Label>
											<Input
												type="number"
												value={newDoc.age_roll_max}
												onChange={(e) => setNewDoc({ ...newDoc, age_roll_max: parseInt(e.target.value, 10) || 0 })}
											/>
										</div>
									</div>
									
									<div className="space-y-1.5">
										<Label>Age Bypass Trait (Optional)</Label>
										<Select
											value={newDoc.age_bypass_trait_id?.toString() || "none"}
											onValueChange={(val) => setNewDoc({ ...newDoc, age_bypass_trait_id: val === "none" || val === null ? null : parseInt(val, 10) })}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a trait to bypass the random age roll...">
													{newDoc.age_bypass_trait_id 
														? newDoc.categories.flatMap((c) => c.traits).find((t) => t.id === newDoc.age_bypass_trait_id)?.name || "Unnamed" 
														: "None"}
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">None</SelectItem>
												{newDoc.categories.flatMap((c) => c.traits).map((t) => (
													<SelectItem key={t.id} value={t.id.toString()}>{t.name || "Unnamed"}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									
								</div>
							)}
						</div>
					<CategoryManager
						categories={newDoc.categories}
						onChange={(newCategories) =>
							setNewDoc({ ...newDoc, categories: newCategories })
						}
					/>

					<DialogFooter className="pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Jump"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
