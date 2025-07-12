'use client';

import * as React from 'react';
import Image from 'next/image';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getShowDetails } from '@/services/tmdb';
import type { TMDbShowDetails } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useShows } from '@/hooks/use-shows';

interface NextEpisodeCardProps {
  showId: number;
}

export function NextEpisodeCard({ showId }: NextEpisodeCardProps) {
  const [details, setDetails] = React.useState<TMDbShowDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { removeShow } = useShows();

  React.useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getShowDetails(showId);
        if (data) {
          setDetails(data);
        } else {
          setError('Não foi possível carregar os detalhes da série.');
        }
      } catch (err) {
        setError('Ocorreu um erro ao buscar os dados.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [showId]);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };
  
  const formatFullDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const nextEpisode = details?.next_episode_to_air;

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-row gap-4 items-start p-4">
            <Skeleton className="w-16 h-24 rounded-md" />
            <div className='flex-1 space-y-2'>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
             <Skeleton className="h-5 w-full" />
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
             <Skeleton className="h-5 w-1/2" />
        </CardFooter>
      </Card>
    );
  }

  if (error || !details) {
    return (
        <Card className="flex flex-col h-full bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive text-base">Erro ao Carregar</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive">{error || 'Não foi possível encontrar a série.'}</p>
            </CardContent>
            <CardFooter className="mt-auto">
                 <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/20" onClick={() => removeShow(showId)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 p-4 relative">
         {details.poster_path && (
             <div className="absolute inset-0 bg-black/50 z-0">
                <Image
                    src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                    alt={`Pôster de ${details.name}`}
                    fill
                    style={{objectFit: 'cover'}}
                    className="opacity-20 blur-sm"
                    data-ai-hint="movie poster"
                />
            </div>
         )}
        <div className="relative z-10 flex-shrink-0">
             <Image
                src={details.poster_path ? `https://image.tmdb.org/t/p/w154${details.poster_path}` : 'https://placehold.co/154x231.png'}
                alt={`Pôster de ${details.name}`}
                width={80}
                height={120}
                className="rounded-md shadow-lg"
                data-ai-hint="movie poster"
            />
        </div>
        <div className="relative z-10 flex-1">
          <CardTitle className="text-lg font-bold text-card-foreground line-clamp-2">{details.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{nextEpisode ? `S${nextEpisode.season_number}:E${nextEpisode.episode_number}` : `Status: ${details.status}`}</p>
        </div>
        <div className="absolute top-2 right-2 z-20">
             <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10" onClick={() => removeShow(details.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">
        <p className="font-semibold line-clamp-1">{nextEpisode ? nextEpisode.name : 'Sem informações sobre o próximo episódio.'}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto text-xs text-muted-foreground font-medium">
         {nextEpisode ? (
            <p title={formatFullDate(nextEpisode.air_date)}>Lançamento: <span className='font-bold text-primary'>{formatDate(nextEpisode.air_date)}</span></p>
         ) : "Data de lançamento indisponível"}
      </CardFooter>
    </Card>
  );
}
