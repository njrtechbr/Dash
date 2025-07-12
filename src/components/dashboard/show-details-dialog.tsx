'use client';

import * as React from 'react';
import Image from 'next/image';
import { getShowDetails, getAllSeasonsDetails } from '@/services/tmdb';
import type { TMDbShowDetails, SeasonDetails, Episode } from '@/types';
import { useShows } from '@/hooks/use-shows';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Tv, Film, Calendar, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '../ui/separator';

interface ShowDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showId: number;
}

function EpisodeItem({ showId, episode }: { showId: number; episode: Episode }) {
    const { shows, toggleWatchedEpisode } = useShows();
    const show = shows.find(s => s.id === showId);
    const episodeId = `S${episode.season_number}E${episode.episode_number}`;
    const isWatched = show?.watched_episodes?.some(e => e.episodeId === episodeId) ?? false;

    return (
        <div className="flex items-start space-x-3 py-3 px-4 hover:bg-muted/50 rounded-md">
            <Checkbox
                id={`ep-${episode.id}`}
                checked={isWatched}
                onCheckedChange={(checked) => {
                    toggleWatchedEpisode(showId, episode, !!checked);
                }}
                className="mt-1"
            />
            <label htmlFor={`ep-${episode.id}`} className="flex-grow cursor-pointer">
                <p className="font-semibold">{episode.episode_number}. {episode.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{episode.overview}</p>
            </label>
        </div>
    )
}


export function ShowDetailsDialog({ open, onOpenChange, showId }: ShowDetailsDialogProps) {
    const [details, setDetails] = React.useState<TMDbShowDetails | null>(null);
    const [seasons, setSeasons] = React.useState<SeasonDetails[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { shows, removeShow, toggleSeasonWatched } = useShows();
    const { toast } = useToast();

    React.useEffect(() => {
        if (open) {
            const fetchAllDetails = async () => {
                setIsLoading(true);
                try {
                    const showDetails = await getShowDetails(showId);
                    if (showDetails) {
                        setDetails(showDetails);
                        const seasonNumbers = showDetails.seasons.map(s => s.season_number);
                        const seasonsDetails = await getAllSeasonsDetails(showId, seasonNumbers);
                        setSeasons(seasonsDetails.sort((a,b) => a.season_number - b.season_number));
                    }
                } catch (error) {
                    console.error("Error fetching show details:", error);
                    toast({
                        variant: "destructive",
                        title: "Erro ao buscar detalhes",
                        description: "Não foi possível carregar os detalhes da série."
                    })
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAllDetails();
        }
    }, [showId, open, toast]);

    const handleRemoveShow = () => {
        removeShow(showId);
        onOpenChange(false);
    }

    const show = shows.find(s => s.id === showId);
    const watchedEpisodeIds = new Set(show?.watched_episodes?.map(e => e.episodeId) ?? []);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
                {isLoading || !details ? (
                     <div className="p-6 space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="space-y-2 pt-4">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                     </div>
                ) : (
                    <>
                    <div className="relative h-56 md:h-72 w-full">
                        {details.backdrop_path && (
                             <Image
                                src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
                                alt={`Fundo de ${details.name}`}
                                fill
                                style={{objectFit:"cover"}}
                                className="rounded-t-lg"
                                data-ai-hint="movie background"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <DialogTitle className="text-3xl font-bold text-foreground drop-shadow-lg">{details.name}</DialogTitle>
                             <div className="flex items-center gap-4 text-sm text-background drop-shadow-sm mt-2">
                                <Badge variant="secondary" className="bg-black/50 text-white/90 border-transparent">{details.status}</Badge>
                                 <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {new Date(details.first_air_date).getFullYear()}</div>
                                <div className="flex items-center gap-1.5"><Tv className="h-4 w-4"/> {details.number_of_seasons} Temporadas</div>
                                <div className="flex items-center gap-1.5"><Film className="h-4 w-4"/> {details.number_of_episodes} Episódios</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                        <div className="md:col-span-1 p-6 pt-0 pr-0 overflow-y-auto">
                            <h3 className="font-bold text-lg mb-2">Sobre a Série</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {details.genres.map(genre => (
                                    <Badge key={genre.id} variant="outline">{genre.name}</Badge>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 pr-6">{details.overview}</p>
                            
                             <div className="flex items-center gap-2 text-sm">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                                <span className="font-bold text-lg">{details.vote_average.toFixed(1)}</span>
                                <span className="text-muted-foreground">({details.vote_count} votos)</span>
                            </div>
                        </div>
                        <div className="md:col-span-2 p-6 pt-0 overflow-y-auto border-l">
                             <h3 className="font-bold text-lg mb-2">Episódios</h3>
                           <Accordion type="multiple" className="w-full">
                                {seasons.map(season => {
                                    if (season.episodes.length === 0) return null;
                                    const seasonEpisodeIds = new Set(season.episodes.map(ep => `S${ep.season_number}E${ep.episode_number}`));
                                    const watchedCount = Array.from(watchedEpisodeIds).filter(id => seasonEpisodeIds.has(id)).length;
                                    const allWatched = watchedCount === season.episodes.length;

                                    return (
                                        <AccordionItem value={`season-${season.season_number}`} key={season.id}>
                                            <AccordionTrigger>
                                                <div className='flex justify-between items-center w-full pr-4'>
                                                    <span className='font-bold text-lg'>{season.name}</span>
                                                    <Badge variant={allWatched ? "default" : "secondary"}>
                                                        {watchedCount} / {season.episodes.length}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className='mb-2 ml-4'
                                                    onClick={() => toggleSeasonWatched(showId, season.episodes, !allWatched)}
                                                >
                                                   <Check className='mr-2 h-4 w-4'/>
                                                   {allWatched ? 'Desmarcar todos' : 'Marcar todos como vistos'}
                                                </Button>
                                                <div className="space-y-1">
                                                    {season.episodes.map(episode => (
                                                        <EpisodeItem key={episode.id} showId={showId} episode={episode} />
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        </div>
                    </div>
                    <DialogFooter className='!justify-between border-t p-4'>
                            <Button variant="destructive" onClick={handleRemoveShow}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover Série
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
