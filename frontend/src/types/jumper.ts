import type { Trait } from "./document";

export interface Jumper {
	id: number;
	name: string;
	builds?: Build[];
}

export interface Build {
	id: number;
	jumper_id: number;
	document_id: number;
	remaining_cp: number;
	traits: Trait[];
}

export interface BuildStats {
  remainingCp: number;
  catCounts: Record<number, number>;
  traitMap: Map<number, { trait: Trait; catId: number }>;
}