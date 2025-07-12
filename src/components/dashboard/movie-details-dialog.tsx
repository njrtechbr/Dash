'use client';

import * as React from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/services/tmdb';
import type { TMDbMovieDetails, WatchProvider } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Film, ExternalLink, Tag, Youtube } from 'lucide-react';
import { Separator } from '../ui/separator';

interface MovieDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: number;
}

const WatchProviderSection = ({ title, providers }: { title: string; providers: WatchProvider[] }) => (
    <div>
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {providers.map(p => (
                <a key={p.provider_id} href={`https://www.themoviedb.org/movie/${p.tmdbId}/watch`} target="_blank" rel="noopener noreferrer">
                     <Badge variant="secondary" className="hover:bg-primary/20 transition-colors">
                        {p.provider_name}
                     </Badge>
                </a>
            ))}
        </div>
    </div>
);


export function MovieDetailsDialog({ open, onOpenChange, movieId }: MovieDetailsDialogProps) {
    const [details, setDetails] = React.useState<TMDbMovieDetails | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
        if (open) {
            const fetchAllDetails = async () => {
                setIsLoading(true);
                try {
                    const movieDetails = await getMovieDetails(movieId);
                    setDetails(movieDetails);
                } catch (error) {
                    console.error("Error fetching movie details:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAllDetails();
        }
    }, [movieId, open]);
    
    const formatRuntime = (minutes: number | null) => {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const releaseYear = details?.release_date ? new Date(details.release_date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const watchInfo = details?.['watch/providers']?.results.BR;

    const trailer = React.useMemo(() => {
        if (!details?.videos?.results) return null;
        const officialTrailer = details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
        return officialTrailer || details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || null;
    }, [details]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
                {isLoading || !details ? (
                     <div className="p-6 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="space-y-2 pt-4">
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                     </div>
                ) : (
                    <>
                    <div className="relative h-64 md:h-80 w-full">
                        {details.backdrop_path && (
                             <Image
                                src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
                                alt={`Fundo de ${details.title}`}
                                fill
                                style={{objectFit:"cover"}}
                                className="rounded-t-lg"
                                data-ai-hint="movie background"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <DialogTitle className="text-3xl font-bold text-foreground drop-shadow-lg">{details.title}</DialogTitle>
                        </div>
                    </div>
                        
                    <ScrollArea className="flex-grow px-6">
                       <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{releaseYear}</span>
                            </div>
                            {details.runtime && (
                                <>
                                 <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatRuntime(details.runtime)}</span>
                                </div>
                                </>
                            )}
                       </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                             {details.genres.map(genre => (
                                <Badge key={genre.id} variant="outline"><Tag className="mr-1 h-3 w-3" />{genre.name}</Badge>
                            ))}
                        </div>

                        <p className="text-foreground/90 leading-relaxed mb-6">{details.overview}</p>
                        
                        {trailer && (
                             <div className="mb-6">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Youtube className="h-5 w-5 text-red-600"/> Trailer Oficial</h3>
                                <div className='aspect-video w-full'>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${trailer.key}`}
                                        title={trailer.name}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className='rounded-lg'
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {watchInfo?.flatrate && <WatchProviderSection title="Streaming" providers={watchInfo.flatrate.map(p => ({...p, tmdbId: details.id}))} />}
                            {watchInfo?.rent && <WatchProviderSection title="Alugar" providers={watchInfo.rent.map(p => ({...p, tmdbId: details.id}))} />}
                            {watchInfo?.buy && <WatchProviderSection title="Comprar" providers={watchInfo.buy.map(p => ({...p, tmdbId: details.id}))} />}
                        </div>
                         
                    </ScrollArea>
                    <DialogFooter className='!justify-between border-t p-4'>
                         <Button asChild variant="outline">
                            <a href={`https://www.themoviedb.org/movie/${details.id}`} target='_blank' rel="noopener noreferrer">
                                <ExternalLink className='mr-2 h-4 w-4' /> Ver no TMDb
                            </a>
                        </Button>
                        <Button type="button" onClick={() => onOpenChange(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
