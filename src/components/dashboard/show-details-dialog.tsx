'use client';

import * as React from 'react';
import { getShowDetails, getAllSeasonsDetails } from '@/services/tmdb';
import type { TMDbShowDetails, SeasonDetails, Episode } from '@/types';
import { useShows } from '@/hooks/use-shows';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
        <div className="flex items-center space-x-3 py-2 px-4 hover:bg-muted/50 rounded-md">
            <Checkbox
                id={`ep-${episode.id}`}
                checked={isWatched}
                onCheckedChange={(checked) => {
                    toggleWatchedEpisode(showId, episode, !!checked);
                }}
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
            <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
                {isLoading || !details ? (
                     <div className="space-y-4">
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
                        <DialogHeader>
                            <DialogTitle>{details.name}</DialogTitle>
                            <DialogDescription>
                                Gerencie os episódios assistidos por temporada.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-grow -mx-6 px-6">
                           <Accordion type="multiple" className="w-full">
                                {seasons.map(season => {
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
                        </ScrollArea>
                        <DialogFooter className='!justify-between'>
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
