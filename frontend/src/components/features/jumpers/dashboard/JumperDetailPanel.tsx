import { useState } from "react";
import type { Jumper, Build } from "../../../../types/jumper";
import type { Document } from "../../../../schemas/documentSchema";
import { Card, CardHeader, CardTitle, CardDescription } from "../../../ui/card";
import { Button, buttonVariants } from "../../../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { Edit, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../../ui/alert-dialog";

interface JumperDetailPanelProps {
	jumper: Jumper;
	documents: Document[];
	docId: string | null;
	onDocChange: (id: string | null) => void;
	onEmbark: () => void;
	onEditBuild: (build: Build) => void;
	onDeleteBuild: (buildId: number) => Promise<void>;
}

export function JumperDetailPanel({
	jumper,
	documents,
	docId,
	onDocChange,
	onEmbark,
	onEditBuild,
	onDeleteBuild,
}: JumperDetailPanelProps) {
	const [deletingBuildId, setDeletingBuildId] = useState<number | null>(null);

	return (
		<div className="w-2/3 p-8 overflow-y-auto bg-background">
			<div className="space-y-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							{jumper.name} 
							<span className="text-lg text-muted-foreground font-normal">
								(Age: {jumper.age} • {jumper.gender})
							</span>
						</h1>
						<p className="text-muted-foreground mt-1">
							Total Jumps Completed: {jumper.builds?.length || 0}
						</p>
					</div>

					<div className="flex gap-2">
						<Select value={docId || null} onValueChange={onDocChange}>
							<SelectTrigger className="w-[250px]">
								<SelectValue placeholder="Select a Jump Document...">
									{docId
										? documents.find((d) => d.id.toString() === docId)?.title
										: undefined}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{[...documents]
									.sort((a, b) => a.title.localeCompare(b.title))
									.map((d) => (
										<SelectItem key={d.id} value={d.id.toString()}>
											{d.title}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
						<Button onClick={onEmbark} disabled={!docId}>
							Embark
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-8">
					{jumper.builds?.map((build) => {
						const doc = documents.find((d) => d.id === build.document_id);
						return (
							<Card
								key={build.id}
								className="group relative transition-all hover:border-primary/50"
							>
								<div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
									<Button
										variant="secondary"
										size="icon"
										className="h-8 w-8 shadow-sm"
										onClick={() => onEditBuild(build)}
									>
										<Edit className="h-4 w-4" />
									</Button>

									<AlertDialog>
										<AlertDialogTrigger
											className={buttonVariants({
												variant: "destructive",
												size: "icon",
												className: "h-8 w-8 shadow-sm",
											})}
										>
											<Trash2 className="h-4 w-4" />
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Delete Build?</AlertDialogTitle>
												<AlertDialogDescription>
													This removes {doc?.title || "this jump"} from the
													jumper's history.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={async () => {
														setDeletingBuildId(build.id);
														await onDeleteBuild(build.id);
														setDeletingBuildId(null);
													}}
													disabled={deletingBuildId === build.id}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													{deletingBuildId === build.id
														? "Deleting..."
														: "Yes, Delete"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>

								<CardHeader className="pr-20">
									<CardTitle>{doc?.title || "Unknown Jump"}</CardTitle>
									<CardDescription>
										Finished with {build.remaining_cp} CP • In-Jump: Age {build.age} ({build.gender})
									</CardDescription>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
