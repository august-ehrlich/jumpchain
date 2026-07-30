import type { Document, TraitCategory } from "../../../../types/document";
import type { BuildStats } from "../../../../types/jumper"
import { TabsContent } from "../../../ui/tabs";
import { BuildTraitCard } from "../builder/BuildTraitCard";
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

export function BuildCategoryView({
	document,
	selectedIds,
	stats,
	onToggle,
}: {
	document: Document;
	selectedIds: Set<number>;
	stats: BuildStats;
	onToggle: (id: number, cat: TraitCategory, isMod: boolean) => void;
}) {
	return (
		<>
			{document.categories.map((cat) => (
				<TabsContent
					key={cat.id}
					value={cat.id.toString()}
					className="flex-1 overflow-y-auto p-8 m-0 outline-none"
				>
					<div className="max-w-4xl mx-auto space-y-6 pb-24">
						<div className="mb-8">
							<h3 className="text-3xl font-bold mb-4">{cat.name}</h3>
							{cat.summary && (
								<div className="text-base text-muted-foreground border-l-4 border-primary/40 pl-6 py-1 italic">
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={mdComponents}
									>
										{cat.summary}
									</ReactMarkdown>
								</div>
							)}
						</div>

						<div className="space-y-4">
							{cat.traits.map((trait) => (
								<BuildTraitCard
									key={trait.id}
									trait={trait}
									category={cat}
									isSelected={selectedIds.has(trait.id)}
									selectedIds={selectedIds}
									getTraitName={(id) =>
										stats.traitMap.get(id)?.trait.name || "Unknown"
									}
									onToggle={() => onToggle(trait.id, cat, trait.is_modifier)}
								/>
							))}
						</div>
					</div>
				</TabsContent>
			))}
		</>
	);
}
