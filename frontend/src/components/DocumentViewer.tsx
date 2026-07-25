import { useState, useEffect } from 'react';
import { documentApi } from '../api/documents';
import { Document } from '../types/document';
import { DocumentHeader } from './documents/DocumentHeader';
import { DocumentTabs } from './documents/DocumentTabs';

export default function DocumentViewer({ documentId }: { documentId: number}) {
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string>('');

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

  if (error) return <div className="text-destructive p-4">{error}</div>;
  if (!document) return <div className="p-4 text-muted-foreground animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6 pt-2">
      <DocumentHeader document={document} />
      <DocumentTabs document={document} />
    </div>
  );
}