import { Document } from '../../types/document';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TraitList } from './TraitList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function DocumentTabs({ document }: { document: Document }) {
  if (!document.categories || document.categories.length === 0) {
    return <p className="text-muted-foreground mt-4">No categories have been added to this document yet.</p>;
  }

  // Use the first category as the default open tab
  const defaultTab = document.categories[0].id.toString();

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto justify-start">
        {document.categories.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.id.toString()} className="flex-1 min-w-[100px]">
            {cat.name} ({cat.traits?.length || 0})
          </TabsTrigger>
        ))}
      </TabsList>
      
      {document.categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id.toString()}>
          {cat.summary && (
            <div className="text-sm text-muted-foreground mt-2 mb-4 max-h-40 overflow-y-auto pr-3">
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
                {cat.summary}
              </ReactMarkdown>
            </div>
          )}
          <TraitList items={cat.traits} hasCost={cat.has_cost} allCategories={document.categories} />
        </TabsContent>
      ))}
    </Tabs>
  );
}