'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LinkItem } from '@/types';

const STORAGE_KEY = 'fluxdash-links';

export const useLinks = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLinks = window.localStorage.getItem(STORAGE_KEY);
      if (storedLinks) {
        setLinks(JSON.parse(storedLinks));
      }
    } catch (error) {
      console.error('Failed to load links from local storage:', error);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = (updatedLinks: LinkItem[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLinks));
    } catch (error) {
      console.error('Failed to save links to local storage:', error);
    }
  };

  const addLink = useCallback((link: Omit<LinkItem, 'id'>) => {
    setLinks((prevLinks) => {
      const newLink = { ...link, id: crypto.randomUUID() };
      const updatedLinks = [...prevLinks, newLink];
      updateLocalStorage(updatedLinks);
      return updatedLinks;
    });
  }, []);

  const updateLink = useCallback((id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>) => {
    setLinks((prevLinks) => {
      const updatedLinks = prevLinks.map((link) =>
        link.id === id ? { ...link, ...updatedFields } : link
      );
      updateLocalStorage(updatedLinks);
      return updatedLinks;
    });
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prevLinks) => {
      const updatedLinks = prevLinks.filter((link) => link.id !== id);
      updateLocalStorage(updatedLinks);
      return updatedLinks;
    });
  }, []);
  
  const reorderLinks = useCallback((reorderedLinks: LinkItem[]) => {
      setLinks(reorderedLinks);
      updateLocalStorage(reorderedLinks);
  }, []);

  return { links, isLoaded, addLink, updateLink, deleteLink, reorderLinks };
};
