import type { Show, WatchedEpisode, Episode } from '@/types';

let cachedShows: Show[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

export async function getShows(): Promise<Show[]> {
  try {
    const now = Date.now();
    
    // Use cache se ainda for válido
    if (now - lastFetchTime < CACHE_DURATION && cachedShows.length > 0) {
      return cachedShows;
    }
    
    const response = await fetch('/api/shows');
    if (!response.ok) {
      throw new Error('Failed to fetch shows');
    }
    
    const shows = await response.json();
    cachedShows = shows;
    lastFetchTime = now;
    
    return shows;
  } catch (error) {
    console.error("Error fetching shows: ", error);
    return cachedShows; // Retorna cache em caso de erro
  }
}

export function subscribeToShows(callback: (shows: Show[]) => void): () => void {
  let isActive = true;
  let lastDataHash = '';
  
  const fetchAndNotify = async () => {
    if (!isActive) return;
    
    const shows = await getShows();
    const dataHash = JSON.stringify(shows);
    
    // Só notifica se os dados mudaram
    if (dataHash !== lastDataHash) {
      lastDataHash = dataHash;
      callback(shows);
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

export function invalidateShowsCache(): void {
  cachedShows = [];
  lastFetchTime = 0;
}

export async function addShow(show: Omit<Show, 'watched_episodes'>): Promise<void> {
  try {
    const response = await fetch('/api/shows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(show),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 409) {
        throw new Error('Série já adicionada');
      }
      throw new Error('Failed to add show');
    }
    
    // Invalida cache após mudança
    invalidateShowsCache();
  } catch(e) {
    console.error("Error adding show: ", e);
    throw e;
  }
}

export async function removeShow(showId: number): Promise<void> {
  try {
    const response = await fetch(`/api/shows/${showId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove show');
    }
    
    // Invalida cache após mudança
    invalidateShowsCache();
  } catch(e) {
    console.error("Error removing show: ", e);
    throw e;
  }
}

export async function toggleWatchedEpisode(show: Show, episode: Episode, isWatched: boolean): Promise<void> {
  const episodeId = `S${episode.season_number}E${episode.episode_number}`;

  try {
    const response = await fetch('/api/shows/episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showId: show.id,
        episodeId,
        episodeName: episode.name,
        isWatched
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle watched episode');
    }
    
    // Invalida cache após mudança
    invalidateShowsCache();
  } catch(e) {
    console.error("Error updating watched episodes: ", e);
    throw e;
  }
}

export async function toggleSeasonWatched(show: Show, seasonEpisodes: Episode[], markAsWatched: boolean): Promise<void> {
  try {
    const response = await fetch('/api/shows/seasons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showId: show.id,
        seasonEpisodes,
        markAsWatched
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle season watched');
    }
    
    // Invalida cache após mudança
    invalidateShowsCache();
  } catch(e) {
    console.error("Error updating season watched episodes: ", e);
    throw e;
  }
}
