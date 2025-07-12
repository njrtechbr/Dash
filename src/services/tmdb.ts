'use server';

import type { TMDbSearchResult, TMDbShowDetails } from '@/types';

const API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchShows(query: string): Promise<TMDbSearchResult[]> {
  if (!API_KEY) {
    throw new Error('A chave da API do TMDb não está configurada.');
  }
  if (!query) {
    return [];
  }

  const url = `${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&include_adult=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Erro na API do TMDb:', await response.text());
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Falha ao buscar séries:', error);
    return [];
  }
}

export async function getShowDetails(showId: number): Promise<TMDbShowDetails | null> {
    if (!API_KEY) {
        throw new Error('A chave da API do TMDb não está configurada.');
    }

    const url = `${API_BASE_URL}/tv/${showId}?api_key=${API_KEY}&language=pt-BR`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Erro ao buscar detalhes da série:', await response.text());
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Falha ao buscar detalhes da série:', error);
        return null;
    }
}
