import type { Document } from "../../../../schemas/documentSchema";
import type { BuildStats } from "../../../../types/jumper";
import { TabsList, TabsTrigger } from "../../../ui/tabs";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";

export function BuildSidebar({
	document,
	stats,
}: {
	document: Document;
	stats: BuildStats;
}) {
	return (
		<div className="w-[340px] lg:w-[380px] border-r bg-muted/10 flex flex-col h-full overflow-hidden shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
			{document.summary && (
				<div className="p-5 border-b max-h-[40%] overflow-y-auto shrink-0 text-sm text-muted-foreground bg-muted/5">
					<MarkdownViewer content={document.summary}/>
				</div>
			)}
			
			<div className="p-3 flex-1 overflow-y-auto">
				<p className="px-3 pt-2 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Categories
				</p>
				<TabsList className="flex flex-col h-auto bg-transparent items-stretch w-full gap-1 p-0">
					{document.categories.map((cat) => (
						<TabsTrigger
							key={cat.id}
							value={cat.id.toString()}
							className="justify-start items-start px-4 py-3 h-auto text-left whitespace-normal border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:border-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
						>
							<div className="flex flex-col items-start gap-0.5 w-full">
								<span className="font-semibold">{cat.name}</span>
								{!cat.is_ordering &&
									<span className="text-xs opacity-70 font-normal">
										{stats.catCounts[cat.id] || 0}
										{cat.max_allowed !== -1 ? ` / ${cat.max_allowed}` : ""} Selected
									</span>
								}
							</div>
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</div>
	);
}