import type { Trait } from "../../../../types/document";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { MarkdownViewer } from "../../../ui/MarkdownViewer";

interface TraitListProps {
	items: Trait[] | undefined;
}

export function TraitList({ items }: TraitListProps) {
	if (!items || items.length === 0) {
		return (
			<p className="text-sm text-muted-foreground text-center py-4">
				No entries defined yet.
			</p>
		);
	}

	return (
		<div className="mt-4 space-y-4">
			{items.map((item) => (
				<Card key={item.id}>
					<CardHeader className="py-3 flex flex-row items-start justify-between space-y-0">
						<div>
							<CardTitle className="text-base flex items-center gap-2">
								{item.name}
								{item.is_modifier && (
									<Badge className="h-5 px-2 text-[10px] uppercase tracking-wider font-semibold bg-primary-foreground text-white">
										Modifier
									</Badge>
								)}
							</CardTitle>
							{item.subtitle && (
								<p className="text-sm text-muted-foreground italic mt-0.5">
									{item.subtitle}
								</p>
							)}
						</div>
						<Badge
							variant={item.cost < 0 ? "default" : "outline"}
							className={
								item.cost < 0
									? "bg-primary text-primary-foreground shrink-0"
									: "shrink-0"
							}
						>
							{item.cost === 0
								? "Free"
								: item.cost < 0
									? `+${Math.abs(item.cost)} CP`
									: `-${item.cost} CP`}
						</Badge>
					</CardHeader>
					<CardContent className="py-3 pt-0 text-sm text-muted-foreground">
						<MarkdownViewer content={item.description} />
					</CardContent>
				</Card>
			))}
		</div>
	);
}