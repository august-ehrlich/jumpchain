import type { Document } from "../../../../types/document";
import { DialogTitle } from "../../../ui/dialog";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";

interface HeaderProps {
	document: Document;
	onDeleteSuccess?: (id: number) => void;
}

export function DocumentHeader({ document }: HeaderProps) {
	return (
		<>
			<div className="flex items-center justify-start gap-4 pr-8">
				<DialogTitle className="text-2xl font-bold break-words mt-1">
					{document.title}
				</DialogTitle>
			</div>

			<div className="space-y-2 mt-4">
				<p className="text-sm font-semibold text-muted-foreground">
					{document.choice_points} Starting CP
				</p>
				<div className="max-h-64 overflow-y-auto pr-3">
					<MarkdownViewer content={document.summary} />
				</div>
			</div>
		</>
	);
}
