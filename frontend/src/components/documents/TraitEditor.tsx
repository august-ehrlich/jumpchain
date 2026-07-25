import { useState } from 'react';
import { Trait, TraitCategory } from '../../types/document';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface TraitEditorProps {
  items: Trait[];
  onChange: (items: Trait[]) => void;
  traitName: string;
  hasCost: boolean;
  allCategories: TraitCategory[];
}

function DiscountPicker({ 
  currentTraitId, 
  allCategories, 
  onAdd 
}: { 
  currentTraitId: number; 
  allCategories: TraitCategory[]; 
  onAdd: (sourceId: number, value: number) => void 
}) {
  const [sourceId, setSourceId] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<string>("");

  const handleAdd = () => {
    const parsedSource = parseInt(sourceId);
    const parsedValue = parseInt(discountValue);
    
    if (isNaN(parsedSource) || isNaN(parsedValue)) return;
    
    onAdd(parsedSource, parsedValue);
    
    setSourceId("");
    setDiscountValue("");
  };

  // Helper to find the exact name of the selected trait ID
  const getSelectedName = () => {
    if (!sourceId) return undefined;
    const id = parseInt(sourceId);
    for (const cat of allCategories) {
      const found = cat.traits.find(t => t.id === id);
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
          {allCategories.map(cat => {
            const validTraits = cat.traits.filter(t => t.id !== currentTraitId);
            if (validTraits.length === 0) return null;

            return (
              <SelectGroup key={cat.id}>
                <SelectLabel>{cat.name || 'Unnamed Category'}</SelectLabel>
                {validTraits.map(t => (
                  <SelectItem key={t.id.toString()} value={t.id.toString()}>
                    {t.name || 'Unnamed Trait'}
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

export function TraitEditor({ items = [], onChange, traitName, hasCost, allCategories }: TraitEditorProps) {
  const handleAdd = () => {
    const newId = -(Date.now() + Math.floor(Math.random() * 10000));
    onChange([...items, { id: newId, name: '', description: '', cost: 0, discounts_received: [] }]);
  };

  const updateItem = (index: number, field: keyof Trait, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const getTraitName = (id: number) => {
    for (const cat of allCategories) {
      const found = cat.traits.find(t => t.id === id);
      if (found) return found.name || 'Unnamed Trait';
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-4 pb-4">
      {items.map((item, idx) => (
        <Card key={item.id} className="relative pt-4 shadow-sm">
          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <CardContent className="space-y-3">
            <div className="flex gap-4 pr-10">
              <Input placeholder="Name" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className="flex-1 font-semibold" />
              <Input placeholder="Subtitle (Optional)" value={item.subtitle} onChange={(e) => updateItem(idx, 'subtitle', e.target.value)} className="flex-1"/>
              {hasCost && (
                <Input type="number" placeholder="Cost" value={item.cost} onChange={(e) => updateItem(idx, 'cost', parseInt(e.target.value) || 0)} className="w-24" />
              )}
            </div>
            
            <Textarea placeholder="Description" value={item.description} rows={2} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
            
            {hasCost && (
              <div className="pt-3 border-t mt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discounts Received</p>
                
                {item.discounts_received?.map((discount, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md">
                    <span className="flex-1">
                      Discounted by <strong>{getTraitName(discount.source_trait_id)}</strong>
                    </span>
                    <Badge variant="secondary">{discount.discount}% off</Badge>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive"
                      onClick={() => {
                        const newDiscounts = [...item.discounts_received];
                        newDiscounts.splice(dIdx, 1);
                        updateItem(idx, 'discounts_received', newDiscounts);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <DiscountPicker 
                  currentTraitId={item.id} 
                  allCategories={allCategories} 
                  onAdd={(sourceId, val) => {
                    const newDiscounts = [...(item.discounts_received || []), { source_trait_id: sourceId, discount: val }];
                    updateItem(idx, 'discounts_received', newDiscounts);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" className="w-full border-dashed" onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" /> Add {traitName}
      </Button>
    </div>
  );
}