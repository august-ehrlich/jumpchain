import type { Trait } from "./document";

export interface BuildStats {
  remainingCp: number;
  catCounts: Record<number, number>;
  traitMap: Map<number, { trait: Trait; catId: number }>;
}

export interface Jumper {
	id: number;
	name: string;
	age: number;
	gender: string;
	builds?: Build[];
	
}

export interface Build {
	id: number;
	jumper_id: number;
	document_id: number;
	remaining_cp: number;
	age: number;
	gender: string;
	traits: Trait[];
}