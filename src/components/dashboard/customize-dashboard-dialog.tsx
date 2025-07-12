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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brush, LayoutGrid } from 'lucide-react';

interface CustomizeDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomizeDashboardDialog({ open, onOpenChange }: CustomizeDashboardDialogProps) {
  const { settings, setSettings, isLoaded } = useDashboardSettings();
  const [selectedIds, setSelectedIds] = React.useState(new Set<string>());
  const [backgroundUrl, setBackgroundUrl] = React.useState('');

  React.useEffect(() => {
    if (open && isLoaded) {
      setSelectedIds(new Set(settings.activeCardIds));
      setBackgroundUrl(settings.backgroundUrl || '');
    }
  }, [open, isLoaded, settings]);
  
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
    setSettings({
        ...settings,
        activeCardIds: Array.from(selectedIds),
        backgroundUrl,
    });
    onOpenChange(false);
  };
  
  if (!isLoaded) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Personalize a aparência e o conteúdo do seu painel.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cards"><LayoutGrid className="mr-2 h-4 w-4" /> Cards</TabsTrigger>
                <TabsTrigger value="appearance"><Brush className="mr-2 h-4 w-4" /> Aparência</TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="py-4">
                 <h4 className="text-sm font-semibold mb-2 text-foreground">Cards Informativos</h4>
                 <p className="text-sm text-muted-foreground mb-4">
                    Selecione os cards que você deseja exibir no seu painel.
                </p>
                <div className="grid grid-cols-2 gap-4">
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
            </TabsContent>
            <TabsContent value="appearance" className="py-4">
                 <div className="space-y-2">
                    <Label htmlFor="background-url">URL da Imagem de Fundo</Label>
                    <Input 
                        id="background-url"
                        placeholder="Cole o link de uma imagem aqui..."
                        value={backgroundUrl}
                        onChange={(e) => setBackgroundUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Deixe em branco para usar a cor de fundo padrão.
                    </p>
                 </div>
            </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
