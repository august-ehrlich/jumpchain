import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "../../../../ui/textarea";
import { Alert, AlertDescription } from "../../../../ui/alert";
import { AlertCircle } from "lucide-react";
import type { DocumentFormData } from "../../../../../schemas/documentSchema";

export function RulesJsonEditor() {
	const { control } = useFormContext<DocumentFormData>();

	return (
		<Controller
			name="rules"
			control={control}
			render={({ field }) => {
				// 1. Only parse the incoming field.value ONCE on mount
				const [textVal, setTextVal] = useState(() => {
					if (!field.value || field.value.length === 0) return "[]";
					return JSON.stringify(field.value, null, 2);
				});
				const [error, setError] = useState<string | null>(null);

				const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
					const val = e.target.value;
					setTextVal(val);
					
					if (!val.trim()) {
						field.onChange([]);
						setError(null);
						return;
					}

					try {
						const parsed = JSON.parse(val);
						if (Array.isArray(parsed)) {
							field.onChange(parsed); // Send the object back to the form
							setError(null);
						} else {
							setError("Rules must be a valid JSON array [...].");
						}
					} catch (err) {
						setError("Invalid JSON format. Check your brackets and quotes.");
					}
				};

				return (
					<div className="space-y-3">
						{error && (
							<Alert variant="destructive" className="py-2">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Textarea
							className={`font-mono text-xs min-h-[400px] bg-muted/30 ${
								error ? "border-destructive focus-visible:ring-destructive" : ""
							}`}
							value={textVal}
							onChange={handleChange}
							spellCheck={false}
							placeholder='[\n  {\n    \"name\": \"Example Rule\",\n    \"conditions\": [],\n    \"effects\": []\n  }\n]'
						/>
					</div>
				);
			}}
		/>
	);
}