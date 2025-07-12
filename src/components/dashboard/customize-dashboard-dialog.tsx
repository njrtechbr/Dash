'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';
import { AVAILABLE_CARDS } from '@/lib/dashboard-cards';

interface CustomizeDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomizeDashboardDialog({ open, onOpenChange }: CustomizeDashboardDialogProps) {
  const { activeCardIds, setActiveCardIds } = useDashboardSettings();
  const [selectedIds, setSelectedIds] = React.useState(new Set(activeCardIds));

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set(activeCardIds));
    }
  }, [open, activeCardIds]);

  const handleToggleCard = (cardId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    setActiveCardIds(Array.from(selectedIds));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customizar Painel</DialogTitle>
          <DialogDescription>
            Selecione os cards que você deseja exibir no seu painel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {AVAILABLE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="flex items-center space-x-2">
                <Checkbox
                  id={card.id}
                  checked={selectedIds.has(card.id)}
                  onCheckedChange={(checked) => handleToggleCard(card.id, !!checked)}
                />
                <Label
                  htmlFor={card.id}
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Icon className="h-4 w-4" />
                  {card.title}
                </Label>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
