'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import type { LinkItem } from '@/types';
import { 
    addLink as dbAddLink,
    addMultipleLinks as dbAddMultipleLinks,
    updateLink as dbUpdateLink,
    deleteLink as dbDeleteLink,
    toggleFavorite as dbToggleFavorite,
    reorderLinks as dbReorderLinks,
    subscribeToLinks
} from '@/services/links-service';

interface LinksState {
  links: LinkItem[];
  isLoaded: boolean;
  linkToEdit: LinkItem | null;
  isLinkDialogOpen: boolean;
  setLinks: (links: LinkItem[]) => void;
  setLoaded: (loaded: boolean) => void;
  addLink: (link: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>) => Promise<void>;
  addMultipleLinks: (newLinks: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[]) => Promise<void>;
  updateLink: (id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  reorderLinks: (draggedId: string, targetId: string) => Promise<void>;
  handleEditLink: (link: LinkItem) => void;
  handleAddNewLink: () => void;
  handleDeleteLink: (id: string) => void;
  setLinkToEdit: (link: LinkItem | null) => void;
  setLinkDialogOpen: (isOpen: boolean) => void;
}

const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  isLoaded: false,
  linkToEdit: null,
  isLinkDialogOpen: false,
  
  setLinks: (links) => set({ links }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),

  addLink: async (link) => {
    await dbAddLink(link);
    // Força atualização imediata
    const freshLinks = await (await fetch('/api/links')).json();
    set({ links: freshLinks });
  },

  addMultipleLinks: async (newLinks) => {
    await dbAddMultipleLinks(newLinks);
    // Força atualização imediata
    const freshLinks = await (await fetch('/api/links')).json();
    set({ links: freshLinks });
  },

  updateLink: async (id, updatedFields) => {
    await dbUpdateLink(id, updatedFields);
    // Força atualização imediata
    const freshLinks = await (await fetch('/api/links')).json();
    set({ links: freshLinks });
  },

  deleteLink: async (id) => {
    await dbDeleteLink(id);
    // Força atualização imediata
    const freshLinks = await (await fetch('/api/links')).json();
    set({ links: freshLinks });
  },

  toggleFavorite: async (id) => {
    const link = get().links.find(l => l.id === id);
    if (link) {
      await dbToggleFavorite(id, !link.isFavorite);
      // Força atualização imediata
      const freshLinks = await (await fetch('/api/links')).json();
      set({ links: freshLinks });
    }
  },

  reorderLinks: async (draggedId, targetId) => {
    const currentLinks = get().links;
    await dbReorderLinks(draggedId, targetId, currentLinks);
    // Força atualização imediata
    const freshLinks = await (await fetch('/api/links')).json();
    set({ links: freshLinks });
  },

  handleEditLink: (link) => {
    set({ linkToEdit: link, isLinkDialogOpen: true });
  },

  handleAddNewLink: () => {
    set({ linkToEdit: null, isLinkDialogOpen: true });
  },

  handleDeleteLink: async (id) => {
    await get().deleteLink(id);
  },

  setLinkToEdit: (link) => {
    set({ linkToEdit: link });
  },

  setLinkDialogOpen: (isOpen) => {
    set({ isLinkDialogOpen: isOpen });
  },
}));

export const useLinks = () => {
  const store = useLinksStore();

  useEffect(() => {
    let lastDataHash = '';
    const unsubscribe = subscribeToLinks((links) => {
      const dataHash = JSON.stringify(links);
      if (dataHash !== lastDataHash) {
        lastDataHash = dataHash;
        store.setLinks(links);
        if (!store.isLoaded) store.setLoaded(true);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
};
