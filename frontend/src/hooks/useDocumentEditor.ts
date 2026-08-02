import { useState, useCallback } from "react";
import type { Document, TraitCategory, Trait } from "../types/document";

export function useDocumentEditor<T extends Document | Omit<Document, "id">>(initialState: T) {
	const [doc, setDoc] = useState<T>(initialState);

	const updateBasics = useCallback((updates: Partial<T>) => {
		setDoc((prev) => ({ ...prev, ...updates }));
	}, []);

	const addCategory = useCallback(() => {
		setDoc((prev) => {
			const newCategory: TraitCategory = {
				id: -Date.now(),
				name: "",
				max_allowed: 1,
				is_random: false,
				traits: [],
			};
			return { ...prev, categories: [...prev.categories, newCategory] };
		});
	}, []);

	const updateCategory = useCallback((index: number, field: keyof TraitCategory, value: any) => {
		setDoc((prev) => {
			const newCategories = [...prev.categories];
			newCategories[index] = { ...newCategories[index], [field]: value };
			return { ...prev, categories: newCategories };
		});
	}, []);

	const removeCategory = useCallback((index: number) => {
		setDoc((prev) => {
			const newCategories = [...prev.categories];
			newCategories.splice(index, 1);
			return { ...prev, categories: newCategories };
		});
	}, []);

	const addTrait = useCallback((categoryIndex: number) => {
		setDoc((prev) => {
			const newCategories = [...prev.categories];
			const newId = -(Date.now() + Math.floor(Math.random() * 10000));
			newCategories[categoryIndex].traits = [
				...newCategories[categoryIndex].traits,
				{ id: newId, name: "", description: "", cost: 0, is_modifier: false },
			];
			return { ...prev, categories: newCategories };
		});
	}, []);

	const updateTrait = useCallback((categoryIndex: number, traitIndex: number, field: keyof Trait, value: any) => {
		setDoc((prev) => {
			const newCategories = [...prev.categories];
			const newTraits = [...newCategories[categoryIndex].traits];
			newTraits[traitIndex] = { ...newTraits[traitIndex], [field]: value };
			newCategories[categoryIndex].traits = newTraits;
			return { ...prev, categories: newCategories };
		});
	}, []);

	const removeTrait = useCallback((categoryIndex: number, traitIndex: number) => {
		setDoc((prev) => {
			const newCategories = [...prev.categories];
			const newTraits = [...newCategories[categoryIndex].traits];
			newTraits.splice(traitIndex, 1);
			newCategories[categoryIndex].traits = newTraits;
			return { ...prev, categories: newCategories };
		});
	}, []);

	return {
		doc,
		setDoc, // Exposed for complete resets or loading external data
		updateBasics,
		addCategory,
		updateCategory,
		removeCategory,
		addTrait,
		updateTrait,
		removeTrait,
	};
}