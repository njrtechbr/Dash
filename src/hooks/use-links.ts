'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LinkItem } from '@/types';

interface LinksState {
  links: LinkItem[];
  isLoaded: boolean;
  linkToEdit: LinkItem | null;
  isLinkDialogOpen: boolean;
  addLink: (link: Omit<LinkItem, 'id'>) => void;
  addMultipleLinks: (newLinks: Omit<LinkItem, 'id'>[]) => void;
  updateLink: (id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (draggedId: string, targetId: string, targetGroup: string) => void;
  handleEditLink: (link: LinkItem) => void;
  handleAddNewLink: () => void;
  handleDeleteLink: (id: string) => void;
  setLinkToEdit: (link: LinkItem | null) => void;
  setLinkDialogOpen: (isOpen: boolean) => void;
}

export const useLinks = create<LinksState>()(
  persist(
    (set, get) => ({
      links: [],
      isLoaded: false,
      linkToEdit: null,
      isLinkDialogOpen: false,
      
      addLink: (link) =>
        set((state) => ({
          links: [...state.links, { ...link, id: crypto.randomUUID() }],
        })),

      addMultipleLinks: (newLinks) =>
        set((state) => ({
          links: [
            ...state.links,
            ...newLinks.map((link) => ({ ...link, id: crypto.randomUUID() })),
          ],
        })),

      updateLink: (id, updatedFields) =>
        set((state) => ({
          links: state.links.map((link) =>
            link.id === id ? { ...link, ...updatedFields } : link
          ),
        })),

      deleteLink: (id) =>
        set((state) => ({
          links: state.links.filter((link) => link.id !== id),
        })),

      reorderLinks: (draggedId, targetId, targetGroup) =>
        set((state) => {
          const currentLinks = [...state.links];
          const draggedItem = currentLinks.find((l) => l.id === draggedId);
          if (!draggedItem) return state;

          const updatedDraggedItem = { ...draggedItem, group: targetGroup };

          let remainingLinks = currentLinks.filter((l) => l.id !== draggedId);
          const targetIndex = remainingLinks.findIndex((l) => l.id === targetId);

          if (targetIndex !== -1) {
            remainingLinks.splice(targetIndex, 0, updatedDraggedItem);
          } else {
            const firstItemOfGroupIndex = remainingLinks.findIndex((l) => l.group === targetGroup);
            if (firstItemOfGroupIndex !== -1) {
              remainingLinks.splice(firstItemOfGroupIndex, 0, updatedDraggedItem);
            } else {
              remainingLinks.push(updatedDraggedItem);
            }
          }
          return { links: remainingLinks };
        }),
        
      handleEditLink: (link) => {
        set({ linkToEdit: link, isLinkDialogOpen: true });
      },

      handleAddNewLink: () => {
        set({ linkToEdit: null, isLinkDialogOpen: true });
      },

      handleDeleteLink: (id) => {
          get().deleteLink(id);
      },
      
      setLinkToEdit: (link) => set({ linkToEdit: link }),
      
      setLinkDialogOpen: (isOpen) => {
          set({ isLinkDialogOpen: isOpen });
          if (!isOpen) {
              set({ linkToEdit: null });
          }
      },
    }),
    {
      name: 'fluxdash-links',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    }
  )
);
