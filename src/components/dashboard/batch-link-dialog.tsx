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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { LinkItem } from '@/types';
import { findIcon } from '@/lib/icons';

interface BatchLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (links: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[]) => void;
}

export function BatchLinkDialog({ open, onOpenChange, onSave }: BatchLinkDialogProps) {
  const [textValue, setTextValue] = React.useState('');
  const { toast } = useToast();

  const handleSave = () => {
    const lines = textValue.split('\n').filter((line) => line.trim() !== '');
    const newLinks: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[] = [];

    for (const line of lines) {
      const parts = line.split(',').map((part) => part.trim());
      if (parts.length < 3 || parts.length > 4) {
        toast({
          variant: 'destructive',
          title: 'Formato Inválido',
          description: `A linha "${line}" não está no formato correto.`,
        });
        return;
      }
      
      const [title, url, iconName, group = 'Geral'] = parts;

      if (!title || !url || !iconName) {
         toast({
          variant: 'destructive',
          title: 'Dados Incompletos',
          description: `A linha "${line}" tem campos obrigatórios em branco.`,
        });
        return;
      }

      try {
        new URL(url);
      } catch (_) {
         toast({
          variant: 'destructive',
          title: 'URL Inválida',
          description: `A URL "${url}" na linha "${line}" não é válida.`,
        });
        return;
      }

      if (findIcon(iconName).displayName === findIcon('Link').displayName && iconName !== 'Link') {
         toast({
          variant: 'destructive',
          title: 'Ícone não encontrado',
          description: `O ícone "${iconName}" não foi encontrado. Usando ícone padrão.`,
        });
      }

      newLinks.push({ title, url, icon: iconName, group });
    }

    if (newLinks.length > 0) {
      onSave(newLinks);
      onOpenChange(false);
      setTextValue('');
    } else {
       toast({
        variant: 'destructive',
        title: 'Nenhum Link Válido',
        description: 'Por favor, insira pelo menos um link no formato correto.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Links em Lote</DialogTitle>
          <DialogDescription>
            Cole os links abaixo, um por linha. Formato: Título, URL, NomeDoIcone, Grupo (opcional).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="batch-links">Links</Label>
            <Textarea
              id="batch-links"
              placeholder="Google, https://google.com, Globe, Trabalho
Netflix, https://netflix.com, Film, Entretenimento
Github, https://github.com, Github, Desenvolvimento"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="h-48"
            />
             <p className="text-xs text-muted-foreground">
              O nome do ícone deve corresponder aos disponíveis no seletor. Se o grupo não for informado, será &apos;Geral&apos;.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar Links
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
