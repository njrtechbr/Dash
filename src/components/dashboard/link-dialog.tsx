'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Loader2 } from 'lucide-react';
import { suggestIcon } from '@/ai/flows/suggest-icon-flow';
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
import { useToast } from '@/hooks/use-toast';

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
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const { toast } = useToast();
  
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

  const handleSuggestIcon = async () => {
    const { title, url } = form.getValues();
    if (!title || !url) {
      toast({
        variant: 'destructive',
        title: 'Dados Incompletos',
        description: 'Por favor, preencha o Título e a URL para sugerir um ícone.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestIcon({ title, url });
      if (result && result.iconName) {
        form.setValue('icon', result.iconName, { shouldValidate: true });
        toast({
          title: 'Ícone Sugerido!',
          description: `O ícone "${result.iconName}" foi selecionado para você.`,
        });
      } else {
        throw new Error('Não foi possível obter uma sugestão.');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro na Sugestão',
        description: 'Não foi possível sugerir um ícone. Tente novamente.',
      });
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

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
                  <div className="flex justify-between items-center">
                    <FormLabel>Ícone</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSuggestIcon}
                      disabled={isSuggesting}
                    >
                      {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Sugerir
                    </Button>
                  </div>
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
