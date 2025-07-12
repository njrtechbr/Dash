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
  title: z.string().min(1, { message: 'Title is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  icon: z.string().min(1, { message: 'Please select an icon.' }),
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
    },
  });

  React.useEffect(() => {
    if (linkToEdit) {
      form.reset({
        title: linkToEdit.title,
        url: linkToEdit.url,
        icon: linkToEdit.icon,
      });
    } else {
      form.reset({
        title: '',
        url: '',
        icon: 'Link',
      });
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
          <DialogTitle>{linkToEdit ? 'Edit Link' : 'Add New Link'}</DialogTitle>
          <DialogDescription>
            {linkToEdit
              ? "Update the details of your link."
              : "Enter the details for your new link to add it to the dashboard."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google Drive" {...field} />
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
