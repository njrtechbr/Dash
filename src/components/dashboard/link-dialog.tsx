'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IconPicker } from './icon-picker';
import type { LinkItem } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Título é obrigatório.' }),
  url: z.string().url({ message: 'Por favor, insira uma URL válida.' }),
  icon: z.string().min(1, { message: 'Por favor, selecione um ícone.' }),
  group: z.string().min(1, { message: 'Grupo é obrigatório.' }).default('Geral'),
});

type LinkFormData = z.infer<typeof formSchema>;

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: LinkFormData, id?: string) => void;
  linkToEdit?: LinkItem | null;
}

export function LinkDialog({
  open,
  onOpenChange,
  onSave,
  linkToEdit,
}: LinkDialogProps) {
  const form = useForm<LinkFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      icon: 'Link',
      group: 'Geral',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (linkToEdit) {
        form.reset({
          title: linkToEdit.title,
          url: linkToEdit.url,
          icon: linkToEdit.icon,
          group: linkToEdit.group || 'Geral',
        });
      } else {
        form.reset({
          title: '',
          url: '',
          icon: 'Link',
          group: 'Geral',
        });
      }
    }
  }, [linkToEdit, form, open]);

  const handleSubmit = (data: LinkFormData) => {
    onSave(data, linkToEdit?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{linkToEdit ? 'Editar Link' : 'Adicionar Novo Link'}</DialogTitle>
          <DialogDescription>
            {linkToEdit
              ? "Atualize os detalhes do seu link."
              : "Insira os detalhes do seu novo link para adicioná-lo ao painel."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Google Drive" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://drive.google.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Trabalho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
