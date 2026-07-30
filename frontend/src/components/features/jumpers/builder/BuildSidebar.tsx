import type { Document } from "../../../../types/document";
import type { BuildStats } from "../../../../types/jumper"
import { TabsList, TabsTrigger } from "../../../ui/tabs";
import remarkGfm from "remark-gfm";
import ReactMarkdown, { type Components } from "react-markdown";

const mdComponents: Components = {
  p: ({ node, ...props }) => (
    <p className="mb-3 last:mb-0 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
};

export function BuildSidebar({
	document,
	stats,
	isEditing,
}: {
	document: Document;
	stats: BuildStats;
	isEditing: boolean;
}) {
	return (
		<div className="w-[320px] lg:w-[380px] border-r bg-muted/20 flex flex-col h-full overflow-hidden shrink-0">
			<div className="p-6 border-b bg-background/50">
				<h2 className="text-2xl font-bold tracking-tight mb-1 line-clamp-2">
					{document.title}
				</h2>
				<p className="text-sm text-muted-foreground mb-6">
					{isEditing ? "Modifying Build" : "Forging New Build"}
				</p>

				<div className="bg-background shadow-sm p-4 rounded-xl border">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
						Remaining CP
					</p>
					<p
						className={`text-4xl font-black leading-none ${stats.remainingCp < 0 ? "text-destructive" : "text-primary"}`}
					>
						{stats.remainingCp}
					</p>
				</div>
			</div>

			{document.summary && (
				<div className="p-6 border-b max-h-[25%] overflow-y-auto shrink-0 text-sm text-muted-foreground">
					<ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
						{document.summary}
					</ReactMarkdown>
				</div>
			)}

			<div className="p-4 flex-1 overflow-y-auto">
				<p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
								<span className="text-xs opacity-70 font-normal">
									{stats.catCounts[cat.id] || 0}
									{cat.max_allowed !== -1 ? ` / ${cat.max_allowed}` : ""}{" "}
									Selected
								</span>
							</div>
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</div>
	);
}
