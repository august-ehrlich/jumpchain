import { Document } from '../../types/document';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TraitList } from './TraitList';

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
          <TraitList items={cat.traits} hasCost={cat.has_cost} allCategories={document.categories} />
        </TabsContent>
      ))}
    </Tabs>
  );
}