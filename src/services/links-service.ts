import type { LinkItem } from '@/types';

let cachedLinks: LinkItem[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

export async function getLinks(): Promise<LinkItem[]> {
  try {
    const now = Date.now();
    
    // Use cache se ainda for válido
    if (now - lastFetchTime < CACHE_DURATION && cachedLinks.length > 0) {
      return cachedLinks;
    }
    
    const response = await fetch('/api/links');
    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }
    
    const links = await response.json();
    cachedLinks = links;
    lastFetchTime = now;
    
    return links;
  } catch (error) {
    console.error("Error fetching links: ", error);
    return cachedLinks; // Retorna cache em caso de erro
  }
}

export function subscribeToLinks(callback: (links: LinkItem[]) => void): () => void {
  let isActive = true;
  let lastDataHash = '';
  
  const fetchAndNotify = async () => {
    if (!isActive) return;
    
    const links = await getLinks();
    const dataHash = JSON.stringify(links);
    
    // Só notifica se os dados mudaram
    if (dataHash !== lastDataHash) {
      lastDataHash = dataHash;
      callback(links);
    }
  };

  // Busca inicial
  fetchAndNotify();

  // Polling reduzido para 30 segundos
  const interval = setInterval(fetchAndNotify, 30000);

  return () => {
    isActive = false;
    clearInterval(interval);
  };
}

export function invalidateLinksCache(): void {
  cachedLinks = [];
  lastFetchTime = 0;
}

export async function addLink(link: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>): Promise<void> {
  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(link),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add link');
    }
    
    // Invalida cache após mudança
    invalidateLinksCache();
  } catch (error) {
    console.error("Error adding link: ", error);
  }
}

export async function addMultipleLinks(newLinks: Omit<LinkItem, 'id' | 'isFavorite' | 'createdAt'>[]): Promise<void> {
  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLinks),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add multiple links');
    }
  } catch (error) {
    console.error("Error adding multiple links: ", error);
  }
}

export async function updateLink(id: string, updatedFields: Partial<Omit<LinkItem, 'id'>>): Promise<void> {
  try {
    const response = await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update link');
    }
    
    // Invalida cache após mudança
    invalidateLinksCache();
  } catch (error) {
    console.error("Error updating link: ", error);
  }
}

export async function deleteLink(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete link');
    }
    
    // Invalida cache após mudança
    invalidateLinksCache();
  } catch (error) {
    console.error("Error deleting link: ", error);
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  try {
    const response = await fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isFavorite }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }
    
    // Invalida cache após mudança
    invalidateLinksCache();
  } catch (error) {
    console.error("Error toggling favorite: ", error);
  }
}

export async function reorderLinks(draggedId: string, targetId: string, currentLinks: LinkItem[]): Promise<void> {
  try {
    const response = await fetch('/api/links/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draggedId, targetId, currentLinks }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reorder links');
    }
    
    // Invalida cache após mudança
    invalidateLinksCache();
  } catch(error) {
    console.error("Error reordering links:", error);
  }
}
