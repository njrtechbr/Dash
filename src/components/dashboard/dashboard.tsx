'use client';

import * as React from 'react';
import { GripVertical, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinks } from '@/hooks/use-links';
import { LinkCard } from './link-card';
import type { LinkItem, DashboardCard as DashboardCardType, FinancialInfo } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeather } from '@/hooks/use-weather';
import { useFinancialData } from '@/hooks/use-financial-data';
import { useTime } from '@/hooks/use-time';
import { cn } from '@/lib/utils';
import { useShows } from '@/hooks/use-shows';
import { NextEpisodeCard } from './next-episode-card';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';
import { AVAILABLE_CARDS } from '@/lib/dashboard-cards';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { MovieCard } from './movie-card';
import { useMovies } from '@/hooks/use-movies';
import { SidebarInset } from '../ui/sidebar';
import { FinancialChartDialog } from './financial-chart-dialog';


interface InfoCardProps {
  data: FinancialInfo;
  title: string;
  icon: React.ElementType;
  error?: string | null;
  isLoading: boolean;
  prefix?: string;
  onCardClick?: () => void;
}

const InfoCard = ({ data, title, icon: Icon, error, isLoading, prefix, onCardClick }: InfoCardProps) => {
    const { value, change, isPositive, footer } = data || {};
    return (
        <Card 
            className={cn(
                "shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-card/80 backdrop-blur-sm",
                onCardClick && "cursor-pointer"
            )}
            onClick={onCardClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                <Skeleton className="h-8 w-3/4 bg-muted/50" />
                ) : error && !value ? (
                <p className="text-sm text-destructive">{error}</p>
                ) : value ? (
                <div className="text-2xl font-bold">{prefix}{value}</div>
                ) : null}

                {isLoading ? (
                    <Skeleton className="h-4 w-1/2 mt-1 bg-muted/50" />
                ) : change !== null && change !== undefined ? (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <span className={cn(
                            "flex items-center gap-1 font-semibold text-sm",
                            isPositive ? "text-green-500" : "text-red-500"
                        )}>
                            {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" /> }
                            {change}
                        </span>
                        <span className="ml-2 hidden sm:inline-block">{footer}</span>
                    </div>
                ) : footer ? (
                    <p className="text-xs text-muted-foreground">{footer}</p>
                ) : null }
            </CardContent>
        </Card>
    )
};

const WeatherCard = () => {
    const { weather, weatherError, isLoading } = useWeather();
    const cardInfo = AVAILABLE_CARDS.find(c => c.id === 'weather')!;
    
    return <InfoCard
        key={cardInfo.id}
        title={cardInfo.title}
        data={{
            value: weather ? `${weather.temp}°C` : null,
            footer: weather ? `Em ${weather.city}` : 'Buscando...',
            change: null,
            isPositive: null
        }}
        icon={cardInfo.icon}
        error={weatherError}
        isLoading={isLoading}
    />
};

const TimeCard = () => {
    const { time, date } = useTime();
    const { isLoaded } = useDashboardSettings();
    const cardInfo = AVAILABLE_CARDS.find(c => c.id === 'time')!;
    const Icon = cardInfo.icon;
    
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cardInfo.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {!isLoaded && <Skeleton className="h-8 w-full bg-muted/50" />}
                 {isLoaded && (
                    <div className="flex items-baseline justify-between flex-wrap gap-2">
                         <div className="text-2xl font-bold">{date}</div>
                         <div className="text-2xl font-mono font-bold flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground"/>
                            {time}
                         </div>
                    </div>
                 )}
                <p className="text-xs text-muted-foreground">Fuso horário local</p>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
  const { links, isLoaded: areLinksLoaded, handleEditLink, handleDeleteLink, reorderLinks, handleAddNewLink } = useLinks();

  const [draggedItem, setDraggedItem] = React.useState<LinkItem | null>(null);
  const [dragOverItem, setDragOverItem] = React.useState<LinkItem | null>(null);
  
  const [isChartOpen, setIsChartOpen] = React.useState(false);
  const [selectedFinancialCard, setSelectedFinancialCard] = React.useState<FinancialInfo | null>(null);

  const { financialData, financialError, isLoading: isFinancialLoading } = useFinancialData();
  const { shows, isLoaded: areShowsLoaded } = useShows();
  const { movies, isLoaded: areMoviesLoaded } = useMovies();
  const { settings, isLoaded: areSettingsLoaded } = useDashboardSettings();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, link: LinkItem) => {
    setDraggedItem(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, link: LinkItem) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== link.id) {
        setDragOverItem(link);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetLink: LinkItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetLink.id) {
        return;
    }
    reorderLinks(draggedItem.id, targetLink.id);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };
  
  const handleFinancialCardClick = (data: FinancialInfo) => {
    if (data.history) {
        setSelectedFinancialCard(data);
        setIsChartOpen(true);
    }
  };

  const { groupedLinks, favoriteLinks } = React.useMemo(() => {
    const favorites: LinkItem[] = [];
    const grouped: Record<string, LinkItem[]> = {};

    links.forEach(link => {
        if (link.isFavorite) {
            favorites.push(link);
        } else {
            const group = link.group || 'Geral';
            if (!grouped[group]) {
                grouped[group] = [];
            }
            grouped[group].push(link);
        }
    });

    return { groupedLinks: grouped, favoriteLinks: favorites };
  }, [links]);

  const isLoaded = areLinksLoaded && areSettingsLoaded;

  const renderCard = (card: DashboardCardType) => {
    switch (card.id) {
        case 'weather':
            return <WeatherCard key={card.id}/>
        case 'time':
            return <TimeCard key={card.id} />;
        default: // Financial cards
            const data = financialData[card.id];
            const prefix = ['USD-BRL', 'EUR-BRL'].includes(card.id) ? 'R$ ' : '';
            
            return <InfoCard
                key={card.id}
                title={card.title}
                prefix={prefix}
                data={data}
                icon={card.icon}
                error={financialError}
                isLoading={isFinancialLoading}
                onCardClick={() => handleFinancialCardClick(data)}
            />
    }
  };

  return (
    <SidebarInset>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        {isLoaded && favoriteLinks.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground/90 flex items-center gap-2"><Star className='h-6 w-6 text-yellow-400 fill-yellow-400'/> Favoritos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    {favoriteLinks.map((link) => (
                        <div key={link.id}>
                            <LinkCard
                            link={link}
                            onEdit={() => handleEditLink(link)}
                            onDelete={() => handleDeleteLink(link.id)}
                            isDragging={false}
                            isDragOver={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {!isLoaded ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full bg-muted/50" />)
            ) : (
                AVAILABLE_CARDS
                    .filter(card => settings.activeCardIds.includes(card.id))
                    .map(card => renderCard(card))
            )}
        </div>
        
        {(!areShowsLoaded || shows.length > 0) && (
          <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground/90">Acompanhando Séries</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {!areShowsLoaded ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[22rem] w-full bg-muted/50" />)
                  ) : (
                      shows.map(show => (
                          <NextEpisodeCard key={show.id} show={show} />
                      ))
                  )}
              </div>
          </div>
        )}
        
        {(!areMoviesLoaded || movies.length > 0) && (
          <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground/90">Filmes para Assistir</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {!areMoviesLoaded ? (
                      Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[20rem] w-full bg-muted/50" />)
                  ) : (
                      movies.map(movie => (
                          <MovieCard key={movie.id} movie={movie} />
                      ))
                  )}
              </div>
          </div>
        )}

        {!isLoaded && (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-12 w-1/4 mb-4 bg-muted/50" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skeleton key={j} className="h-32 w-full bg-muted/50" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
        {isLoaded && links.length > 0 && (
            <div className="space-y-4">
                <Accordion type="multiple" defaultValue={Object.keys(groupedLinks)} className="w-full space-y-4">
                    {Object.entries(groupedLinks).map(([group, groupLinks]) => (
                    <AccordionItem value={group} key={group} className="border-none">
                        <AccordionTrigger className="text-2xl font-bold tracking-tight px-4 py-3 bg-card/80 backdrop-blur-sm rounded-lg shadow-sm hover:no-underline">
                        {group}
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                            {groupLinks.map((link) => (
                            <div
                                key={link.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, link)}
                                onDragOver={(e) => handleDragOver(e, link)}
                                onDrop={(e) => handleDrop(e, link)}
                                onDragEnd={handleDragEnd}
                                onDragLeave={() => setDragOverItem(null)}
                                className="cursor-move"
                            >
                                <LinkCard
                                link={link}
                                onEdit={() => handleEditLink(link)}
                                onDelete={() => handleDeleteLink(link.id)}
                                isDragging={draggedItem?.id === link.id}
                                isDragOver={dragOverItem?.id === link.id}
                                />
                            </div>
                            ))}
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
          </div>
        )}
        {isLoaded && links.length === 0 && shows.length === 0 && movies.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm mt-16 bg-card/50">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className='p-4 bg-primary/10 rounded-full'>
                <GripVertical className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Seu painel está vazio
              </h3>
              <p className="text-sm text-muted-foreground">
                Adicione seus sistemas web, filmes ou séries para começar.
              </p>
              <button
                 className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                 onClick={handleAddNewLink}
              >
                Adicionar Primeiro Link
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedFinancialCard && (
        <FinancialChartDialog 
            open={isChartOpen}
            onOpenChange={setIsChartOpen}
            data={selectedFinancialCard}
        />
      )}
    </SidebarInset>
  );
}
