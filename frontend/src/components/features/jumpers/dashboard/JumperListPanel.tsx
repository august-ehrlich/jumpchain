import { useState } from "react";
import type { Jumper } from "../../../../types/jumper";
import { Card, CardHeader, CardTitle } from "../../../ui/card";
import { Button, buttonVariants } from "../../../ui/button";
import { Trash2 } from "lucide-react";
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

interface JumperListPanelProps {
	jumpers: Jumper[];
	selectedId?: number;
	onSelect: (j: Jumper) => void;
	onNew: () => void;
	onDelete: (id: number) => Promise<void>;
}

export function JumperListPanel({
	jumpers,
	selectedId,
	onSelect,
	onNew,
	onDelete,
}: JumperListPanelProps) {
	const [deletingId, setDeletingId] = useState<number | null>(null);

	return (
		<div className="w-1/3 border-r bg-muted/10 p-6 flex flex-col gap-4 overflow-y-auto">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">Your Jumpers</h2>
				<Button size="sm" onClick={onNew}>
					New
				</Button>
			</div>
			{jumpers.map((j) => (
				<Card
					key={j.id}
					className={`cursor-pointer transition-colors group relative ${selectedId === j.id ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
					onClick={() => onSelect(j)}
				>
					<div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
						<AlertDialog>
							<AlertDialogTrigger
								className={buttonVariants({
									variant: "destructive",
									size: "icon",
									className: "h-8 w-8 shadow-sm",
								})}
								onClick={(e) => e.stopPropagation()}
							>
								<Trash2 className="h-4 w-4" />
							</AlertDialogTrigger>
							<AlertDialogContent onClick={(e) => e.stopPropagation()}>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete {j.name}?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently delete this jumper and all of their
										builds.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel onClick={(e) => e.stopPropagation()}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={async (e) => {
											e.stopPropagation();
											setDeletingId(j.id);
											await onDelete(j.id);
											setDeletingId(null);
										}}
										disabled={deletingId === j.id}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{deletingId === j.id ? "Deleting..." : "Yes, Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>

					<CardHeader className="py-4 pr-14">
						<CardTitle className="text-lg">{j.name}</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
