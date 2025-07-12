'use client';

import * as React from 'react';
import Image from 'next/image';
import { format, isToday, isTomorrow, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getShowDetails, getSeasonDetails } from '@/services/tmdb';
import type { TMDbShowDetails, Episode, WatchProvider, WatchedEpisode } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { Trash2, CheckCircle2, Tv, Circle, CalendarClock, History } from 'lucide-react';
import { useShows } from '@/hooks/use-shows';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NextEpisodeCardProps {
  showId: number;
  onHistoryClick: (showName: string, episodes: WatchedEpisode[]) => void;
}

const getProviderLogo = (providerName: string) => {
    const providerMap: Record<string, string> = {
        "Netflix": "/providers/netflix.png",
        "Amazon Prime Video": "/providers/prime-video.png",
        "Disney+": "/providers/disney-plus.png",
        "Star+": "/providers/star-plus.png",
        "Max": "/providers/max.png",
        "Apple TV+": "/providers/apple-tv-plus.png",
        "Paramount+": "/providers/paramount-plus.png",
        "Globoplay": "/providers/globoplay.png",
    };
    return providerMap[providerName];
}


export function NextEpisodeCard({ showId, onHistoryClick }: NextEpisodeCardProps) {
  const [details, setDetails] = React.useState<TMDbShowDetails | null>(null);
  const [futureEpisodes, setFutureEpisodes] = React.useState<Episode[]>([]);
  const [watchProviders, setWatchProviders] = React.useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { shows, removeShow, toggleWatchedEpisode } = useShows();

  const show = shows.find(s => s.id === showId);

  React.useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getShowDetails(showId);
        if (data) {
          setDetails(data);
          
          if (data['watch/providers']?.results?.BR?.flatrate) {
             setWatchProviders(data['watch/providers'].results.BR.flatrate);
          }

          const episodesToFetch: Episode[] = [];
          if (data.next_episode_to_air) {
              episodesToFetch.push(data.next_episode_to_air);
          }

          const seasonNumberToFetch = data.next_episode_to_air?.season_number || data.seasons[data.seasons.length - 1]?.season_number;
          if(seasonNumberToFetch && seasonNumberToFetch > 0) {
             const seasonDetails = await getSeasonDetails(showId, seasonNumberToFetch);
             if (seasonDetails && seasonDetails.episodes) {
                 const upcoming = seasonDetails.episodes
                    .filter(ep => ep.air_date && isPast(parseISO(ep.air_date)) === false)
                    .slice(0, 3);
                 setFutureEpisodes(upcoming);
             }
          }

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
    return format(date, "dd/MM", { locale: ptBR });
  };
  
  const nextEpisode = futureEpisodes[0];
  const isReleasedToday = nextEpisode && isToday(parseISO(nextEpisode.air_date));
  const episodeId = nextEpisode ? `S${nextEpisode.season_number}E${nextEpisode.episode_number}` : null;
  const isWatched = episodeId ? show?.watched_episodes?.some(e => e.episodeId === episodeId) : false;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
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
    <Card className={cn(
        "flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative",
        isReleasedToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
       {isReleasedToday && <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full z-20 animate-pulse">LANÇAMENTO</div>}
      
      <CardHeader className="p-0">
        <div className="relative h-32">
             {details.poster_path ? (
                 <Image
                    src={`https://image.tmdb.org/t/p/w500${details.backdrop_path || details.poster_path}`}
                    alt={`Pôster de ${details.name}`}
                    fill
                    style={{objectFit: 'cover'}}
                    className="opacity-80"
                    data-ai-hint="movie poster"
                />
             ) : (
                <div className='w-full h-full bg-secondary'/>
             )}
             <div className='absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent'/>
             <div className="absolute -bottom-8 left-4 z-10">
                 <Image
                    src={details.poster_path ? `https://image.tmdb.org/t/p/w154${details.poster_path}` : 'https://placehold.co/92x138.png'}
                    alt={`Pôster de ${details.name}`}
                    width={80}
                    height={120}
                    className="rounded-md shadow-lg border-2 border-background"
                    data-ai-hint="movie poster"
                />
            </div>
             <div className="absolute top-2 right-2 z-20 flex gap-1">
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 bg-black/20 hover:text-white hover:bg-black/50" onClick={() => onHistoryClick(details.name, show?.watched_episodes || [])}>
                    <History className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 bg-black/20 hover:text-white hover:bg-black/50" onClick={() => removeShow(details.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
             {watchProviders.length > 0 && (
                <div className="absolute bottom-2 right-2 z-10 flex gap-2">
                    <TooltipProvider>
                        {watchProviders.slice(0, 3).map(provider => {
                            const logo = getProviderLogo(provider.provider_name);
                            return logo ? (
                                <Tooltip key={provider.provider_id}>
                                    <TooltipTrigger>
                                        <Image src={logo} alt={provider.provider_name} width={28} height={28} className="rounded-full bg-white/10 p-0.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>{provider.provider_name}</TooltipContent>
                                </Tooltip>
                            ) : null;
                        })}
                    </TooltipProvider>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-2 pt-10">
        <CardTitle className="text-lg font-bold text-card-foreground line-clamp-1">{details.name}</CardTitle>
        {nextEpisode ? (
            <>
                <p className="text-sm font-semibold text-primary line-clamp-1">{`S${nextEpisode.season_number}:E${nextEpisode.episode_number} - ${nextEpisode.name}`}</p>
                <p className="text-xs text-muted-foreground">{`Próximo episódio: ${formatDate(nextEpisode.air_date)}`}</p>
            </>
        ) : (
             <p className="text-sm text-muted-foreground mt-2">Sem informações de próximos episódios.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2 mt-auto flex flex-col items-start gap-2">
         {nextEpisode && episodeId && (
            <Button variant={isWatched ? 'secondary' : 'default'} size="sm" className="w-full" onClick={() => toggleWatchedEpisode(showId, episodeId, nextEpisode.name)}>
                {isWatched ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <Tv className="mr-2 h-4 w-4"/>}
                {isWatched ? 'Episódio Assistido' : 'Marcar como Assistido'}
            </Button>
         )}
         {futureEpisodes.length > 1 && (
             <div className="text-xs text-muted-foreground w-full space-y-1 pt-2">
                <p className='font-bold flex items-center gap-1'><CalendarClock className='h-3 w-3'/> Próximas Datas:</p>
                {futureEpisodes.slice(1, 3).map(ep => (
                    <div key={ep.id} className="flex justify-between items-center pl-2">
                         <span>S{ep.season_number}:E{ep.episode_number}</span>
                         <span className='font-medium'>{format(parseISO(ep.air_date), 'dd/MM/yyyy')}</span>
                    </div>
                ))}
             </div>
         )}
      </CardFooter>
    </Card>
  );
}
