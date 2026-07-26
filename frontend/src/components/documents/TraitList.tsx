import { Trait, TraitCategory } from '../../types/document';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm';

interface TraitListProps {
  items: Trait[] | undefined;
  hasCost: boolean;
  allCategories: TraitCategory[];
}

export function TraitList({ items, hasCost, allCategories }: TraitListProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No entries defined yet.</p>;
  }

  const getTraitName = (id: number) => {
    for (const cat of allCategories) {
      const found = cat.traits.find(t => t.id === id);
      if (found) return found.name || 'Unnamed Trait';
    }
    return 'Unknown';
  };

  // Native browser API for formatting lists ("A, B, and C")
  const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

  return (
    <div className="mt-4 space-y-4">
      {items.map((item) => {
        // Group discounts by their value before rendering
        const discountsByValue = new Map<number, string[]>();
        
        item.discounts_received?.forEach(disc => {
          const name = getTraitName(disc.source_trait_id);
          if (!discountsByValue.has(disc.discount)) {
            discountsByValue.set(disc.discount, []);
          }
          discountsByValue.get(disc.discount)!.push(name);
        });

        return (
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
                {discountsByValue.size > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(discountsByValue.entries()).map(([value, sources], idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-normal">
                        Discounted {value}% by <strong>{listFormatter.format(sources)}</strong>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {hasCost && (
                <Badge variant={item.cost < 0 ? "default" : "outline"} className={item.cost < 0 ? "bg-primary text-primary-foreground shrink-0" : "shrink-0"}>
                  {item.cost === 0 ? 'Free' : (item.cost < 0 ? `+${Math.abs(item.cost)} CP` : `-${item.cost} CP`)}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  del: ({node, ...props}) => <del className="line-through text-muted-foreground/70" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mt-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mt-2 space-y-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                  a: ({node, ...props}) => <a className="text-primary underline underline-offset-4" {...props} />
                }}
              >
                {item.description}
              </ReactMarkdown>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}