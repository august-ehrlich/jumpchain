import { useState, useEffect } from "react";
import { documentApi } from "../../api/documents";
import type { Document } from "../../schemas/documentSchema";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import DocumentViewer from "../features/documents/viewer/DocumentViewer";
import { DocumentCard } from "../features/documents/viewer/DocumentCard";
import { CreateDocumentDialog } from "../features/documents/editor/CreateDocumentDialog";
import { EditDocumentDialog } from "../features/documents/editor/EditDocumentDialog";

export default function DocumentListView() {
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
	const [editingDoc, setEditingDoc] = useState<Document | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	useEffect(() => {
		async function load() {
			try {
				setDocuments(await documentApi.getAll());
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	if (loading)
		return (
			<div className="p-8 text-muted-foreground">Loading documents...</div>
		);

	return (
		<div className="p-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<h1 className="text-3xl font-bold">Available Jumps</h1>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="mr-2 h-4 w-4" /> Add New Jump
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{documents.map((doc) => (
					<DocumentCard
						key={doc.id}
						doc={doc}
						onClick={setSelectedDoc}
						onEdit={setEditingDoc}
						onDelete={async (id) => {
							await documentApi.delete(id);
							setDocuments(documents.filter((d) => d.id !== id));
							toast.success("Document deleted successfully");
						}}
					/>
				))}
				{documents.length === 0 && (
					<p className="text-muted-foreground col-span-full">
						No documents found. Create one!
					</p>
				)}
			</div>

			<Dialog
				open={selectedDoc !== null}
				onOpenChange={(isOpen) => !isOpen && setSelectedDoc(null)}
			>
				<DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto hide-scrollbar">
					{selectedDoc && <DocumentViewer documentId={selectedDoc.id} />}
				</DialogContent>
			</Dialog>

			<CreateDocumentDialog
				isOpen={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				onSuccess={(created : any) => {
					setDocuments([...documents, created]);
					setIsCreateOpen(false);
				}}
			/>

			<EditDocumentDialog
				doc={editingDoc}
				onOpenChange={(isOpen) => !isOpen && setEditingDoc(null)}
				onSuccess={(updated) => {
					setDocuments(
						documents.map((d) => (d.id === updated.id ? updated : d)),
					);
				}}
			/>
		</div>
	);
}
