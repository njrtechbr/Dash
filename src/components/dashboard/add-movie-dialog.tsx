'use client';

import * as React from 'react';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { searchMovies } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useMovies } from '@/hooks/use-movies';
import type { TMDbMovieSearchResult } from '@/types';
import { PlusCircle, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { suggestMovies } from '@/ai/flows/suggest-movies-flow';

interface AddMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMovieDialog({ open, onOpenChange }: AddMovieDialogProps) {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = React.useState<TMDbMovieSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const { addMovie, movies } = useMovies();
  const { toast } = useToast();

  const performSearch = React.useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await searchMovies(searchQuery);
      setResults(data);
       if (data.length === 0) {
        toast({
            variant: 'default',
            title: 'Nenhum filme encontrado',
            description: `Não encontramos resultados para "${searchQuery}".`
        })
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro na busca',
        description: 'Não foi possível buscar os filmes. Verifique se a chave da API do TMDb está configurada.',
      });
    }
    setIsLoading(false);
  }, [toast]);

  React.useEffect(() => {
    if (debouncedQuery.length > 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  const handleAddMovie = (movie: TMDbMovieSearchResult) => {
    addMovie({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    });
    onOpenChange(false);
    setQuery('');
    setResults([]);
  };
  
  const handleSuggest = async () => {
    setIsSuggesting(true);
    setResults([]);
    try {
        const watchedMovies = movies.map(m => m.title);
        const suggestions = await suggestMovies({ prompt: query, watchedMovies });

        if (suggestions.recommendations.length === 0) {
            toast({
                title: 'Nenhuma sugestão nova',
                description: `Não encontramos novas sugestões baseadas na sua busca. Tente algo diferente!`,
            });
        } else {
             toast({
                title: 'Sugestões da IA',
                description: `Encontramos ${suggestions.recommendations.length} filmes para você!`,
            });
        }

        const searchPromises = suggestions.recommendations.map(rec => searchMovies(`${rec.title} ${rec.year}`));
        const searchResults = await Promise.all(searchPromises);
        
        const finalResults = searchResults.map((res, index) => {
            const bestMatch = res.find(movie => movie.title.toLowerCase().includes(suggestions.recommendations[index].title.toLowerCase()));
            return bestMatch;
        }).filter((movie): movie is TMDbMovieSearchResult => Boolean(movie));

        setResults(finalResults);
        
    } catch(error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erro na Sugestão',
            description: 'Não foi possível obter sugestões da IA. Tente novamente.',
        });
    } finally {
        setIsSuggesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Filme</DialogTitle>
          <DialogDescription>
            Busque ou descreva o que você gosta e use a IA para sugestões.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Input
            placeholder="Ex: Pulp Fiction ou 'filmes de terror dos anos 80'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-20"
          />
           <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2" 
                onClick={handleSuggest} 
                disabled={isSuggesting || isLoading}
            >
                {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                <span className="sr-only">Sugerir</span>
            </Button>
        </div>
        <ScrollArea className="h-80 border rounded-md">
          <div className="p-2 space-y-2">
            {(isLoading || isSuggesting) && (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-16 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            )}
            {!isLoading && !isSuggesting && results.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                {query.length > 2 ? 'Nenhum filme encontrado.' : 'Digite para buscar ou use a IA.'}
              </div>
            )}
            {!isLoading && !isSuggesting && results.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="w-12 flex-shrink-0">
                  <Image
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://placehold.co/92x138.png'}
                    alt={`Pôster de ${movie.title}`}
                    width={48}
                    height={72}
                    className="rounded"
                    data-ai-hint="movie poster"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{movie.release_date?.substring(0,4)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleAddMovie(movie)}>
                  <PlusCircle className="h-5 w-5 text-primary" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
