import { useState, useEffect } from 'react';
import { documentApi } from '../../api/documents';
import { Document } from '../../types/document';
import DocumentViewer from '../DocumentViewer';
import { Plus } from 'lucide-react';

// Shadcn components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from "sonner";

export default function DocumentListView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fully typed initial state matching the updated API client
  const [newDoc, setNewDoc] = useState<Omit<Document, 'id'>>({
    title: '',
    choice_points: 1000,
    summary: '',
    origins: [],
    perks: [],
    items: [],
    drawbacks: []
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await documentApi.getAll();
        setDocuments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Available Jumps</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Jump
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
            onClick={() => setSelectedDoc(doc)}
          >
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">{doc.title}</CardTitle>
              <CardDescription className="font-medium">{doc.choice_points} CP</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3 text-muted-foreground">{doc.summary}</p>
            </CardContent>
          </Card>
        ))}
        
        {documents.length === 0 && (
          <p className="text-muted-foreground col-span-full">No documents found. Create one to get started!</p>
        )}
      </div>

      <Dialog open={selectedDoc !== null} onOpenChange={(isOpen) => !isOpen && setSelectedDoc(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {selectedDoc && (
            <DocumentViewer 
              documentId={selectedDoc.id} 
              onDeleteSuccess={(deletedId) => {
              setDocuments(documents.filter(d => d.id !== deletedId));
              setSelectedDoc(null);
            }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Jump</DialogTitle>
          </DialogHeader>
          
          <form 
            className="space-y-5 py-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              
              try {
                const created = await documentApi.create(newDoc);
                setDocuments([...documents, created]);
                setIsCreateOpen(false);
                setNewDoc({ 
                  title: '', 
                  choice_points: 1000, 
                  summary: '',
                  origins: [],
                  perks: [],
                  items: [],
                  drawbacks: []
                });
                toast.success(`Jump "${created.title}" created successfully!`);
              } catch (err) {
                console.error("Failed to create document", err);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Pokemon Trainer, Cyberpunk 2077..."
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cp">Starting Choice Points (CP)</Label>
              <Input
                id="cp"
                type="number"
                required
                value={newDoc.choice_points}
                onChange={(e) => setNewDoc({ ...newDoc, choice_points: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                required
                placeholder="A brief description of this world..."
                rows={4}
                value={newDoc.summary}
                onChange={(e) => setNewDoc({ ...newDoc, summary: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Jump"}
              </Button>
            </DialogFooter>
          </form>
          
        </DialogContent>
      </Dialog>
    </div>
  );
}