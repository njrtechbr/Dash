'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LinkItem } from '@/types';

interface LinksState {
  links: LinkItem[];
  isLoaded: boolean;
  linkToEdit: LinkItem | null;
  isLinkDialogOpen: boolean;
  addLink: (link: Omit<LinkItem, 'id' | 'isFavorite'>) => void;
  addMultipleLinks: (newLinks: Omit<LinkItem, 'id' | 'isFavorite'>[]) => void;
  updateLink: (id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>) => void;
  deleteLink: (id: string) => void;
  toggleFavorite: (id: string) => void;
  reorderLinks: (draggedId: string, targetId: string) => void;
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
          links: [...state.links, { ...link, id: crypto.randomUUID(), isFavorite: false }],
        })),

      addMultipleLinks: (newLinks) =>
        set((state) => ({
          links: [
            ...state.links,
            ...newLinks.map((link) => ({ ...link, id: crypto.randomUUID(), isFavorite: false })),
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
        
      toggleFavorite: (id) =>
        set((state) => ({
          links: state.links.map((link) =>
            link.id === id ? { ...link, isFavorite: !link.isFavorite } : link
          ),
        })),

      reorderLinks: (draggedId, targetId) =>
        set((state) => {
          const currentLinks = [...state.links];
          const draggedItemIndex = currentLinks.findIndex((l) => l.id === draggedId);
          const targetItemIndex = currentLinks.findIndex((l) => l.id === targetId);
          
          if (draggedItemIndex === -1 || targetItemIndex === -1) return state;

          const [draggedItem] = currentLinks.splice(draggedItemIndex, 1);
          
          // Update group if dropping on a different group (and not into favorites)
          const targetItem = currentLinks[targetItemIndex > draggedItemIndex ? targetItemIndex -1 : targetItemIndex];
          if (!targetItem.isFavorite) {
              draggedItem.group = targetItem.group;
          }

          const newTargetIndex = currentLinks.findIndex((l) => l.id === targetId);
          currentLinks.splice(newTargetIndex, 0, draggedItem);
          
          return { links: currentLinks };
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
