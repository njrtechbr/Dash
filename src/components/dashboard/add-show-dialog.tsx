'use client';

import * as React from 'react';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { searchShows } from '@/services/tmdb';
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
import { useShows } from '@/hooks/use-shows';
import type { TMDbSearchResult } from '@/types';
import { Search, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AddShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddShowDialog({ open, onOpenChange }: AddShowDialogProps) {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = React.useState<TMDbSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { addShow } = useShows();
  const { toast } = useToast();

  React.useEffect(() => {
    if (debouncedQuery.length > 2) {
      const fetchResults = async () => {
        setIsLoading(true);
        try {
            const data = await searchShows(debouncedQuery);
            setResults(data);
        } catch(error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro na busca',
                description: 'Não foi possível buscar as séries. Verifique se a chave da API do TMDb está configurada corretamente no arquivo .env.'
            })
        }
        setIsLoading(false);
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, toast]);

  const handleAddShow = (show: TMDbSearchResult) => {
    addShow({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
    });
    onOpenChange(false);
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Série</DialogTitle>
          <DialogDescription>
            Busque pelo nome da série que você deseja acompanhar.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da série..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="h-80 border rounded-md">
          <div className="p-2 space-y-2">
            {isLoading && (
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
            {!isLoading && results.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                {debouncedQuery.length > 2 ? 'Nenhuma série encontrada.' : 'Digite para buscar.'}
              </div>
            )}
            {!isLoading && results.map((show) => (
              <div
                key={show.id}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="w-12 flex-shrink-0">
                  <Image
                    src={show.poster_path ? `https://image.tmdb.org/t/p/w92${show.poster_path}` : 'https://placehold.co/92x138.png'}
                    alt={`Pôster de ${show.name}`}
                    width={48}
                    height={72}
                    className="rounded"
                    data-ai-hint="movie poster"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{show.name}</p>
                  <p className="text-xs text-muted-foreground">{show.first_air_date?.substring(0,4)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleAddShow(show)}>
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
