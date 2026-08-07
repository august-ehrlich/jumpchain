import { useState, useEffect } from "react";
import { jumperApi } from "../../api/jumpers";
import { documentApi } from "../../api/documents";
import { toast } from "sonner";
import type { Jumper, Build } from "../../types/jumper";
import type { Document } from "../../schemas/documentSchema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import { CreateBuildDialog } from "../features/jumpers/builder/CreateBuildDialog";
import { JumperListPanel } from "../features/jumpers/dashboard/JumperListPanel";
import { JumperDetailPanel } from "../features/jumpers/dashboard/JumperDetailPanel";

export default function JumpersView() {
	const [jumpers, setJumpers] = useState<Jumper[]>([]);
	const [selectedJumper, setSelectedJumper] = useState<Jumper | null>(null);
	const [loading, setLoading] = useState(true);

	const [newJumperName, setNewJumperName] = useState("");
	const [isCreatingJumper, setIsCreatingJumper] = useState(false);

	const [documents, setDocuments] = useState<Document[]>([]);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

	const [buildTargetDoc, setBuildTargetDoc] = useState<Document | null>(null);
	const [editingBuild, setEditingBuild] = useState<Build | undefined>(
		undefined,
	);

	const [newJumperAge, setNewJumperAge] = useState("18");
	const [newJumperGender, setNewJumperGender] = useState("Male");

	useEffect(() => {
		Promise.all([jumperApi.getAll(), documentApi.getAll()]).then(([j, d]) => {
			setJumpers(j);
			setDocuments(d);
			setLoading(false);
		});
	}, []);

	const handleCreateJumper = async () => {
		if (!newJumperName || !newJumperAge || !newJumperGender) return;
		const parsedAge = parseInt(newJumperAge, 10);
		const created = await jumperApi.create(newJumperName, parsedAge, newJumperGender);
		setJumpers([...jumpers, created]);
		setNewJumperName("");
		setNewJumperAge("18");
		setIsCreatingJumper(false);
		setNewJumperGender("Male");
	};

	const handleDeleteJumper = async (id: number) => {
		await jumperApi.delete(id);
		setJumpers(jumpers.filter((j) => j.id !== id));
		if (selectedJumper?.id === id) {
			setSelectedJumper(null);
		}
		toast.success("Jumper permanently deleted");
	};

	const handleDeleteBuild = async (buildId: number) => {
		if (!selectedJumper) return;
		await jumperApi.deleteBuild(selectedJumper.id, buildId);
		toast.success("Build removed from history");
		refreshSelectedJumper();
	};

	const startEditBuild = (build: Build) => {
		const doc = documents.find((d) => d.id === build.document_id);
		if (doc) {
			setEditingBuild(build);
			setBuildTargetDoc(doc);
		}
	};

	const refreshSelectedJumper = async () => {
		if (!selectedJumper) return;
		const refreshed = await jumperApi.get(selectedJumper.id);
		setSelectedJumper(refreshed);
		setBuildTargetDoc(null);
		setEditingBuild(undefined);

		setJumpers((prev) =>
			prev.map((j) => (j.id === refreshed.id ? refreshed : j)),
		);
	};

	if (loading) return <div className="p-8">Loading Jumpers...</div>;

	return (
		<div className="flex h-full overflow-hidden">
			<JumperListPanel
				jumpers={jumpers}
				selectedId={selectedJumper?.id}
				onSelect={(j) => jumperApi.get(j.id).then(setSelectedJumper)}
				onNew={() => setIsCreatingJumper(true)}
				onDelete={handleDeleteJumper}
			/>

			{selectedJumper ? (
				<JumperDetailPanel
					jumper={selectedJumper}
					documents={documents}
					docId={selectedDocId}
					onDocChange={setSelectedDocId}
					onEmbark={() => {
						const doc = documents.find(
							(d) => d.id.toString() === selectedDocId,
						);
						if (doc) setBuildTargetDoc(doc);
					}}
					onEditBuild={startEditBuild}
					onDeleteBuild={handleDeleteBuild}
				/>
			) : (
				<div className="w-2/3 flex items-center justify-center text-muted-foreground">
					Select a Jumper to view their chain.
				</div>
			)}

			<Dialog open={isCreatingJumper} onOpenChange={setIsCreatingJumper}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Jumper</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<Input
							placeholder="Jumper Name"
							value={newJumperName}
							onChange={(e) => setNewJumperName(e.target.value)}
						/>
						<Input
							type="number"
							placeholder="Starting Age (Required)"
							value={newJumperAge}
							onChange={(e) => setNewJumperAge(e.target.value)}
						/>
						<Input
							placeholder="Gender (Male, Female, etc.)"
							value={newJumperGender}
							onChange={(e) => setNewJumperGender(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCreatingJumper(false)}>Cancel</Button>
						<Button onClick={handleCreateJumper}>Create</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{buildTargetDoc && selectedJumper && (
				<CreateBuildDialog
					jumper={selectedJumper} // Changed from jumperId={selectedJumper.id}
					document={buildTargetDoc}
					buildToEdit={editingBuild}
					onOpenChange={(isOpen) => {
						if (!isOpen) {
							setBuildTargetDoc(null);
							setEditingBuild(undefined);
						}
					}}
					onSuccess={refreshSelectedJumper}
				/>
			)}
		</div>
	);
}
