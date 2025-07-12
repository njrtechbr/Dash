'use client';

import * as React from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinks } from '@/hooks/use-links';
import { LinkCard } from './link-card';
import { LinkDialog } from './link-dialog';
import type { LinkItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { links, isLoaded, addLink, updateLink, deleteLink, reorderLinks } = useLinks();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [linkToEdit, setLinkToEdit] = React.useState<LinkItem | null>(null);

  const [draggedItem, setDraggedItem] = React.useState<LinkItem | null>(null);
  const [dragOverItem, setDragOverItem] = React.useState<LinkItem | null>(null);

  const { toast } = useToast();

  const handleAddClick = () => {
    setLinkToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (link: LinkItem) => {
    setLinkToEdit(link);
    setDialogOpen(true);
  };

  const handleSaveLink = (data: Omit<LinkItem, 'id'>, id?: string) => {
    if (id) {
      updateLink(id, data);
      toast({ title: "Link Updated", description: "Your link has been successfully updated." });
    } else {
      addLink(data);
      toast({ title: "Link Added", description: "Your new link has been added to the dashboard." });
    }
  };
  
  const handleDeleteLink = (id: string) => {
    deleteLink(id);
    toast({ title: "Link Deleted", description: "The link has been removed from your dashboard.", variant: 'destructive' });
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, link: LinkItem) => {
    setDraggedItem(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, link: LinkItem) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== link.id) {
        setDragOverItem(link);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetLink: LinkItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetLink.id) {
        return;
    }

    const currentLinks = [...links];
    const draggedIndex = currentLinks.findIndex((l) => l.id === draggedItem.id);
    const targetIndex = currentLinks.findIndex((l) => l.id === targetLink.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = currentLinks.splice(draggedIndex, 1);
    currentLinks.splice(targetIndex, 0, removed);
    
    reorderLinks(currentLinks);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-[60px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <h1 className="text-xl font-bold tracking-tight">FluxDash</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        {!isLoaded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}
        {isLoaded && links.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {links.map((link) => (
              <div
                key={link.id}
                draggable
                onDragStart={(e) => handleDragStart(e, link)}
                onDragOver={(e) => handleDragOver(e, link)}
                onDrop={(e) => handleDrop(e, link)}
                onDragEnd={handleDragEnd}
                onDragLeave={() => setDragOverItem(null)}
                className="cursor-move"
              >
                <LinkCard
                  link={link}
                  onEdit={() => handleEditClick(link)}
                  onDelete={() => handleDeleteLink(link.id)}
                  isDragging={draggedItem?.id === link.id}
                  isDragOver={dragOverItem?.id === link.id}
                />
              </div>
            ))}
          </div>
        )}
        {isLoaded && links.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-16">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className='p-4 bg-primary/10 rounded-full'>
                <GripVertical className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Your dashboard is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Add your favorite web systems to get started.
              </p>
              <Button className="mt-4" onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Link
              </Button>
            </div>
          </div>
        )}
      </main>

      <LinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveLink}
        linkToEdit={linkToEdit}
      />
    </div>
  );
}
