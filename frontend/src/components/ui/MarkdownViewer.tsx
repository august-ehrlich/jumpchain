import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
	content: string;
	className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					del: ({ node, ...props }) => (
						<del
							className="line-through text-muted-foreground/70"
							{...props}
						/>
					),
					p: ({ node, ...props }) => (
						<p className="mb-4 last:mb-0" {...props} />
					),
					ul: ({ node, ...props }) => (
						<ul className="list-disc pl-5 mt-2 space-y-1" {...props} />
					),
					ol: ({ node, ...props }) => (
						<ol className="list-decimal pl-5 mt-2 space-y-1" {...props} />
					),
					strong: ({ node, ...props }) => (
						<strong className="font-semibold text-foreground" {...props} />
					),
					a: ({ node, ...props }) => (
						<a
							className="text-primary underline underline-offset-4"
							{...props}
						/>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}