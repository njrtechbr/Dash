'use client';

import * as React from 'react';
import Image from 'next/image';
import { format, isToday, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Episode, Show } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { Tv, CalendarClock, ExternalLink } from 'lucide-react';
import { useShows } from '@/hooks/use-shows';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface NextEpisodeCardProps {
  show: Show;
}

export function NextEpisodeCard({ show }: NextEpisodeCardProps) {
  const { details: allDetails, handleShowDetailsClick } = useShows();
  const [progress, setProgress] = React.useState(0);
  const details = allDetails[show.id];
  const { shows } = useShows();
  
  const currentShow = shows.find(s => s.id === show.id);

  React.useEffect(() => {
    if (details && currentShow) {
        const totalEpisodes = details.seasons
            .filter(s => s.season_number > 0 && s.episode_count > 0)
            .reduce((acc, s) => acc + s.episode_count, 0);

        const watchedCount = currentShow?.watched_episodes?.length || 0;

        if (totalEpisodes > 0) {
            setProgress((watchedCount / totalEpisodes) * 100);
        }
    }
  }, [details, currentShow]);


  if (!details) {
    return <Skeleton className="h-[22rem] w-full bg-muted/50" />;
  }
  
  const nextEpisode: Episode | null = details.next_episode_to_air || details.last_episode_to_air;
  const watchProviders = details['watch/providers']?.results?.BR?.flatrate || [];

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };
  
  const isReleasedToday = nextEpisode && nextEpisode.air_date && isToday(parseISO(nextEpisode.air_date));

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleShowDetailsClick(details!.id)
  }

  return (
    <Card 
        className={cn("flex flex-col h-[22rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative group cursor-pointer bg-card/80 backdrop-blur-sm")}
        onClick={() => handleShowDetailsClick(details.id)}
    >
       {isReleasedToday && <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full z-20 animate-pulse">LANÇAMENTO HOJE</div>}
       <button onClick={() => handleShowDetailsClick(details.id)} className='absolute inset-0 z-10 sr-only'>
          <span className='sr-only'>Ver detalhes de {details.name}</span>
       </button>
      
      <CardHeader className="p-0">
        <div className="relative h-40">
             {details.poster_path ? (
                 <Image
                    src={`https://image.tmdb.org/t/p/w500${details.backdrop_path || details.poster_path}`}
                    alt={`Pôster de ${details.name}`}
                    fill
                    style={{objectFit: 'cover'}}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                    data-ai-hint="movie poster"
                />
             ) : (
                <div className='w-full h-full bg-secondary'/>
             )}
             <div className='absolute inset-0 bg-gradient-to-t from-card/30 via-card/70 to-card'/>
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
            {watchProviders.length > 0 && (
                <div className="absolute bottom-2 right-2 z-10 flex gap-1.5 flex-wrap justify-end">
                    {watchProviders.slice(0, 2).map(provider => (
                        <Badge key={provider.provider_id} variant="secondary" className='bg-black/50 text-white/90 border-transparent text-xs'>
                            {provider.provider_name}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-2 pt-10 flex-grow">
        <CardTitle className="text-lg font-bold text-card-foreground line-clamp-1">{details.name}</CardTitle>
         <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
             <Tv className="h-3 w-3" />
             <span>{details.number_of_seasons} Temporadas</span>
             <span>•</span>
             <span>{details.number_of_episodes} Episódios</span>
         </div>

        {nextEpisode && nextEpisode.air_date ? (
            <div className='mt-2 space-y-1'>
                 <p className='font-bold flex items-center gap-1 text-sm text-primary'>
                    <CalendarClock className='h-4 w-4'/> 
                    {isPast(parseISO(nextEpisode.air_date)) ? "Último Lançamento" : "Próximo Episódio"}
                </p>
                <p className="text-sm font-semibold line-clamp-1">{`T${nextEpisode.season_number}:E${nextEpisode.episode_number} - ${nextEpisode.name}`}</p>
                <p className="text-xs text-muted-foreground">{`Lançamento: ${formatDate(nextEpisode.air_date)}`}</p>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground mt-2">Sem informações de novos episódios.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto flex flex-col items-start gap-2">
            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
                    <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
            <Button onClick={handleButtonClick} variant='secondary' className='w-full z-20'>
                <ExternalLink className='mr-2 h-4 w-4' /> Gerenciar Série
            </Button>
      </CardFooter>
    </Card>
  );
}
