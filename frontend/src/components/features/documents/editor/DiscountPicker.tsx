import type { TraitCategory } from "../../../../types/document";
import { useState } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";

export function DiscountPicker({
	currentTraitId,
	allCategories,
	onAdd,
}: {
	currentTraitId: number;
	allCategories: TraitCategory[];
	onAdd: (sourceId: number, value: number) => void;
}) {
	const [sourceId, setSourceId] = useState<string>("");
	const [discountValue, setDiscountValue] = useState<string>("");

	const handleAdd = () => {
		const parsedSource = parseInt(sourceId, 10);
		const parsedValue = parseInt(discountValue, 10);

		if (Number.isNaN(parsedSource) || Number.isNaN(parsedValue)) return;

		onAdd(parsedSource, parsedValue);

		setSourceId("");
		setDiscountValue("");
	};

	// Helper to find the exact name of the selected trait ID
	const getSelectedName = () => {
		if (!sourceId) return undefined;
		const id = parseInt(sourceId, 10);
		for (const cat of allCategories) {
			const found = cat.traits.find((t) => t.id === id);
			if (found) return found.name || "Unnamed Trait";
		}
		return "Unknown";
	};

	return (
		<div className="flex items-center gap-2 pt-1">
			<Select value={sourceId} onValueChange={(val) => setSourceId(val || "")}>
				<SelectTrigger className="w-[280px] h-9">
					{/* Explicitly pass the resolved string title so it never shows the ID */}
					<SelectValue placeholder="Select requirement/origin...">
						{getSelectedName()}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{allCategories.map((cat) => {
						const validTraits = cat.traits.filter(
							(t) => t.id !== currentTraitId,
						);
						if (validTraits.length === 0) return null;

						return (
							<SelectGroup key={cat.id}>
								<SelectLabel>{cat.name || "Unnamed Category"}</SelectLabel>
								{validTraits.map((t) => (
									<SelectItem key={t.id.toString()} value={t.id.toString()}>
										{t.name || "Unnamed Trait"}
									</SelectItem>
								))}
							</SelectGroup>
						);
					})}
				</SelectContent>
			</Select>

			<Input
				type="number"
				placeholder="Value (e.g. 100)"
				className="w-32 h-9"
				value={discountValue}
				onChange={(e) => setDiscountValue(e.target.value)}
			/>

			<Button type="button" size="sm" className="h-9" onClick={handleAdd}>
				Add
			</Button>
		</div>
	);
}
