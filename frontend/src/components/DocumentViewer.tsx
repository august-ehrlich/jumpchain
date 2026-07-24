import { useState, useEffect } from 'react';
import { documentApi } from '../api/documents';
import { Document } from '../types/document';
import { Trash2 } from 'lucide-react';

import { Button, buttonVariants } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
} from "./ui/alert-dialog";
import { DialogTitle } from './ui/dialog';

export default function DocumentViewer({ 
  documentId, 
  onDeleteSuccess 
}: { 
  documentId: number;
  onDeleteSuccess?: (id: number) => void;
}) {
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadDocument() {
      try {
        const data = await documentApi.get(documentId);
        setDocument(data);
      } catch (err) {
        setError('Failed to load document');
      }
    }
    loadDocument();
  }, [documentId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await documentApi.delete(documentId);
      if (onDeleteSuccess) {
        onDeleteSuccess(documentId);
      }
    } catch (err) {
      console.error("Failed to delete document", err);
      setIsDeleting(false);
    }
  };

  if (error) return <div className="text-destructive p-4">{error}</div>;
  if (!document) return <div className="p-4 text-muted-foreground animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6 pt-2">
      
      <div className="flex items-center gap-4 pr-8">
        <DialogTitle className="text-2xl font-bold break-words">
          {document.title}
        </DialogTitle>

        {/* Delete Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogTrigger 
            className={buttonVariants({ variant: "destructive", className: "shrink-0" })}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{document.title}" and wipe out all its associated origins, perks, items, and drawbacks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Subtitle & Summary Row */}
      <div className="space-y-2 mt-4">
        <p className="text-sm font-semibold text-muted-foreground">
          {document.choice_points} Starting CP
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {document.summary}
        </p>
      </div>

      {/* Tabs for Nested Content */}
      <Tabs defaultValue="origins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="origins">Origins ({document.origins?.length || 0})</TabsTrigger>
          <TabsTrigger value="perks">Perks ({document.perks?.length || 0})</TabsTrigger>
          <TabsTrigger value="items">Items ({document.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="drawbacks">Drawbacks ({document.drawbacks?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="origins" className="mt-4 space-y-4">
          {document.origins?.map((origin) => (
            <Card key={origin.id}>
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{origin.name}</CardTitle>
                <Badge variant="outline">{origin.cost === 0 ? 'Free' : `-${origin.cost} CP`}</Badge>
              </CardHeader>
              <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                {origin.description}
              </CardContent>
            </Card>
          ))}
          {(!document.origins || document.origins.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No origins defined yet.</p>
          )}
        </TabsContent>

        <TabsContent value="perks" className="mt-4 space-y-4">
          {document.perks?.map((perk) => (
            <Card key={perk.id}>
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{perk.name}</CardTitle>
                <Badge variant="outline">{perk.cost === 0 ? 'Free' : `-${perk.cost} CP`}</Badge>
              </CardHeader>
              <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                {perk.description}
              </CardContent>
            </Card>
          ))}
          {(!document.perks || document.perks.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No perks defined yet.</p>
          )}
        </TabsContent>

        <TabsContent value="items" className="mt-4 space-y-4">
          {document.items?.map((item) => (
            <Card key={item.id}>
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge variant="outline">{item.cost === 0 ? 'Free' : `-${item.cost} CP`}</Badge>
              </CardHeader>
              <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
          {(!document.items || document.items.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No items defined yet.</p>
          )}
        </TabsContent>

        <TabsContent value="drawbacks" className="mt-4 space-y-4">
          {document.drawbacks?.map((drawback) => (
            <Card key={drawback.id}>
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{drawback.name}</CardTitle>
                {/* Note: Drawbacks give points, so we render a + profit here instead of a cost */}
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                  +{drawback.profit} CP
                </Badge>
              </CardHeader>
              <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                {drawback.description}
              </CardContent>
            </Card>
          ))}
          {(!document.drawbacks || document.drawbacks.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No drawbacks defined yet.</p>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}