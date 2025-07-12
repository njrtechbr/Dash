'use client';

import * as React from 'react';
import Image from 'next/image';
import type { TMDbMovieDetails, Movie, WatchProvider } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { Calendar, Clock, Trash2, Tag, Eye, CheckCircle2 } from 'lucide-react';
import { useMovies } from '@/hooks/use-movies';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const { removeMovie, toggleMovieWatched, details: allDetails, handleMovieDetailsClick } = useMovies();
  
  const details = allDetails[movie.id];

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }
  
  if (!details) {
    return <Skeleton className="h-[20rem] w-full bg-muted/50" />;
  }
  
  const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : '';
  const watchProviders = details['watch/providers']?.results?.BR?.flatrate || [];

  return (
    <Card 
        className={cn(
            "flex flex-col h-[20rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative group cursor-pointer bg-card/80 backdrop-blur-sm",
            movie.watched && "border-green-500/50"
        )}
        onClick={() => handleMovieDetailsClick(movie.id)}
    >
      {movie.watched && (
        <div className='absolute inset-0 bg-black/60 z-10 flex items-center justify-center'>
            <CheckCircle2 className='h-16 w-16 text-green-500'/>
        </div>
      )}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={movie.watched ? 'secondary' : 'default'} size="icon" className="h-8 w-8" onClick={(e) => handleButtonClick(e, () => toggleMovieWatched(movie.id))}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Marcar como assistido</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{movie.watched ? 'Marcar como não assistido' : 'Marcar como assistido'}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => handleButtonClick(e, () => removeMovie(movie.id))}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Filme</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Remover da lista</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
      
      <CardHeader className="p-0">
        <div className="relative h-48">
             {details.backdrop_path ? (
                 <Image
                    src={`https://image.tmdb.org/t/p/w500${details.backdrop_path}`}
                    alt={`Pôster de ${details.title}`}
                    fill
                    style={{objectFit: 'cover'}}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                    data-ai-hint="movie poster"
                />
             ) : (
                <div className='w-full h-full bg-secondary flex items-center justify-center'>
                   <p className='text-muted-foreground text-sm'>Sem imagem de fundo</p>
                </div>
             )}
             <div className='absolute inset-0 bg-gradient-to-t from-card/30 via-card/70 to-card'/>
             <div className="absolute -bottom-8 left-4 z-10">
                 <Image
                    src={details.poster_path ? `https://image.tmdb.org/t/p/w154${details.poster_path}` : 'https://placehold.co/92x138.png'}
                    alt={`Pôster de ${details.title}`}
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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <CardTitle className="text-lg font-bold text-card-foreground line-clamp-1 cursor-default">{details.title}</CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{details.title}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

         <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
             <Calendar className="h-3 w-3" />
             <span>{releaseYear}</span>
             {details.runtime && (
                <>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatRuntime(details.runtime)}</span>
                </>
             )}
         </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto flex flex-wrap gap-1">
            {details.genres.slice(0, 3).map(genre => (
                <Badge key={genre.id} variant="outline" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" /> {genre.name}
                </Badge>
            ))}
      </CardFooter>
    </Card>
  );
}
