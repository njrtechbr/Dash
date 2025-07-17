import type { Movie } from '@/types';

let cachedMovies: Movie[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

export async function getMovies(): Promise<Movie[]> {
  try {
    const now = Date.now();
    
    // Use cache se ainda for válido
    if (now - lastFetchTime < CACHE_DURATION && cachedMovies.length > 0) {
      return cachedMovies;
    }
    
    const response = await fetch('/api/movies');
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    
    const movies = await response.json();
    cachedMovies = movies;
    lastFetchTime = now;
    
    return movies;
  } catch (error) {
    console.error("Error fetching movies: ", error);
    return cachedMovies; // Retorna cache em caso de erro
  }
}

export function subscribeToMovies(callback: (movies: Movie[]) => void): () => void {
  let isActive = true;
  let lastDataHash = '';
  let timeoutId: NodeJS.Timeout | null = null;
  
  const fetchAndNotify = async () => {
    if (!isActive) return;
    
    try {
      const movies = await getMovies();
      const dataHash = JSON.stringify(movies);
      
      // Só notifica se os dados mudaram
      if (dataHash !== lastDataHash) {
        lastDataHash = dataHash;
        callback(movies);
      }
      
      // Agendar próxima verificação apenas se ainda estiver ativo
      if (isActive) {
        timeoutId = setTimeout(fetchAndNotify, 30000);
      }
    } catch (error) {
      console.error("Error in fetchAndNotify for movies:", error);
      // Em caso de erro, tentar novamente após um tempo
      if (isActive) {
        timeoutId = setTimeout(fetchAndNotify, 60000); // Tempo maior em caso de erro
      }
    }
  };

  // Busca inicial
  fetchAndNotify();

  return () => {
    isActive = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

export function invalidateMoviesCache(): void {
  cachedMovies = [];
  lastFetchTime = 0;
}

export async function addMovie(movie: Omit<Movie, 'watched'>): Promise<void> {
  try {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 409) {
        throw new Error('Filme já adicionado');
      }
      throw new Error('Failed to add movie');
    }
    
    // Invalida cache após mudança
    invalidateMoviesCache();
  } catch(e) {
    console.error("Error adding movie: ", e);
    throw e;
  }
}

export async function removeMovie(movieId: number): Promise<void> {
  try {
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove movie');
    }
    
    // Invalida cache após mudança
    invalidateMoviesCache();
  } catch (e) {
    console.error("Error removing movie: ", e);
    throw e;
  }
}

export async function toggleMovieWatched(movieId: number, watched: boolean): Promise<void> {
  try {
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ watched }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle movie watched state');
    }
    
    // Invalida cache após mudança
    invalidateMoviesCache();
  } catch(e) {
    console.error("Error toggling watched state: ", e);
    throw e;
  }
}
