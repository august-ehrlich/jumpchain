import { Document } from '../../types/document';
import { DialogTitle } from '../ui/dialog';
import ReactMarkdown from 'react-markdown';


interface HeaderProps {
  document: Document;
  onDeleteSuccess?: (id: number) => void;
}

export function DocumentHeader({ document }: HeaderProps) {
  return (
    <>
      <div className="flex items-center justify-start gap-4 pr-8">
        <DialogTitle className="text-2xl font-bold break-words mt-1">
          {document.title}
        </DialogTitle>
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-sm font-semibold text-muted-foreground">{document.choice_points} Starting CP</p>
          <ReactMarkdown 
            components={{
              // Restore bullet points
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mt-2 space-y-1" {...props} />,
              // Restore numbered lists
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mt-2 space-y-1" {...props} />,
              // Ensure bold text stands out against the muted foreground
              strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
              // Optional: style links if users include them
              a: ({node, ...props}) => <a className="text-primary underline underline-offset-4" {...props} />
            }}
          >
            {document.summary}
          </ReactMarkdown>
      </div>
    </>
  );
}