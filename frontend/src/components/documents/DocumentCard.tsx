import { useState } from 'react';
import { Document } from '../../types/document';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button, buttonVariants } from '../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import ReactMarkdown from 'react-markdown';

interface DocumentCardProps {
  doc: Document;
  onClick: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (id: number) => Promise<void>;
}

export function DocumentCard({ doc, onClick, onEdit, onDelete }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(doc.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative"
      onClick={() => onClick(doc)}
    >
      {/* Absolute positioned action buttons (visible on hover) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 shadow-sm" 
          onClick={(e) => { e.stopPropagation(); onEdit(doc); }}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger 
            className={buttonVariants({ variant: "destructive", size: "icon", className: "h-8 w-8 shadow-sm" })}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete "{doc.title}".</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader>
        {/* pr-16 prevents long titles from sliding under the buttons */}
        <CardTitle className="group-hover:text-primary transition-colors pr-16">{doc.title}</CardTitle>
        <CardDescription className="font-medium">{doc.choice_points} CP</CardDescription>
      </CardHeader>
      <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
        <ReactMarkdown
          components={{
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mt-2 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mt-2 space-y-1" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
            a: ({node, ...props}) => <a className="text-primary underline underline-offset-4" {...props} />
          }}
        >
          {doc.summary}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}