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
import { Brush, LayoutGrid, Monitor, Moon, Sun } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { type Theme } from '@/hooks/use-dashboard-settings';

interface CustomizeDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomizeDashboardDialog({ open, onOpenChange }: CustomizeDashboardDialogProps) {
  const { settings, setSettings, isLoaded } = useDashboardSettings();
  const [selectedIds, setSelectedIds] = React.useState(new Set<string>());
  const [backgroundUrl, setBackgroundUrl] = React.useState('');
  const [theme, setTheme] = React.useState<Theme>('system');

  React.useEffect(() => {
    if (open && isLoaded) {
      setSelectedIds(new Set(settings.activeCardIds));
      setBackgroundUrl(settings.backgroundUrl || '');
      setTheme(settings.theme || 'system');
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
        theme,
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
            <TabsContent value="appearance" className="py-4 space-y-6">
                 <div className="space-y-2">
                    <Label>Tema</Label>
                    <RadioGroup value={theme} onValueChange={(value: Theme) => setTheme(value)} className="grid grid-cols-3 gap-2">
                        <div>
                            <RadioGroupItem value="light" id="light" className="peer sr-only" />
                            <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Sun className="mb-2 h-5 w-5" />
                                Claro
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                            <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Moon className="mb-2 h-5 w-5" />
                                Escuro
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="system" id="system" className="peer sr-only" />
                            <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Monitor className="mb-2 h-5 w-5" />
                                Sistema
                            </Label>
                        </div>
                    </RadioGroup>
                 </div>
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
