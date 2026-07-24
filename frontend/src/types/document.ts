export interface Origin {
  id: number;
  name: string;
  cost: number;
  description: string;
}

export interface Perk {
  id: number;
  name: string;
  cost: number;
  description: string;
}

export interface Item {
  id: number;
  name: string;
  cost: number;
  description: string;
}

export interface Drawback {
  id: number;
  name: string;
  profit: number;
  description: string;
}
export interface Document {
  id: number;
  title: string;
  choice_points: number;
  summary: string;
  
  // Nested relationships
  origins: Origin[];
  perks: Perk[];
  items: Item[];
  drawbacks: Drawback[];
}