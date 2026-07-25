export interface Discount {
  source_trait_id: number;
  discount: number;
}

export interface Trait {
  id: number;
  name: string;
  subtitle?: string;
  description: string;
  cost: number;
  discounts_received: Discount[];
}

export interface TraitCategory {
  id: number;
  name: string;
  summary?: string;
  has_cost: boolean;
  traits: Trait[];
}

export interface Document {
  id: number;
  title: string;
  choice_points: number;
  summary: string;
  categories: TraitCategory[];
}