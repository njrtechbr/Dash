'use client';

import * as React from 'react';
import { Plus, GripVertical, Layers, LayoutGrid, Tv, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinks } from '@/hooks/use-links';
import { LinkCard } from './link-card';
import { LinkDialog } from './link-dialog';
import { BatchLinkDialog } from './batch-link-dialog';
import type { LinkItem, DashboardCard as DashboardCardType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeather } from '@/hooks/use-weather';
import { useFinancialData } from '@/hooks/use-financial-data';
import { useTime } from '@/hooks/use-time';
import { cn } from '@/lib/utils';
import { AddShowDialog } from './add-show-dialog';
import { useShows } from '@/hooks/use-shows';
import { NextEpisodeCard } from './next-episode-card';
import { ShowDetailsDialog } from './show-details-dialog';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';
import { AVAILABLE_CARDS } from '@/lib/dashboard-cards';
import { CustomizeDashboardDialog } from './customize-dashboard-dialog';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AddMovieDialog } from './add-movie-dialog';
import { MovieCard } from './movie-card';
import { useMovies } from '@/hooks/use-movies';
import { MovieDetailsDialog } from './movie-details-dialog';


interface InfoCardProps {
  title: string;
  value?: string | null;
  icon: React.ElementType;
  footer?: string | null;
  error?: string | null;
  isLoading: boolean;
  change?: string | null;
  isPositive?: boolean | null;
  prefix?: string;
}

const InfoCard = ({ title, value, icon: Icon, footer, error, isLoading, change, isPositive, prefix }: InfoCardProps) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : error && !value ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : value ? (
              <div className="text-2xl font-bold">{prefix}{value}</div>
            ) : null}

            {isLoading ? (
                <Skeleton className="h-4 w-1/2 mt-1" />
            ) : change !== null && change !== undefined ? (
                 <div className="flex items-center text-xs text-muted-foreground">
                    <span className={cn(
                        "flex items-center gap-1 font-semibold",
                        isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {change}
                    </span>
                    <span className="ml-2 hidden sm:inline-block">{footer}</span>
                </div>
            ) : footer ? (
                <p className="text-xs text-muted-foreground">{footer}</p>
            ) : null }
        </CardContent>
    </Card>
);

const TimeCard = () => {
    const { time, date } = useTime();
    const { isLoaded } = useDashboardSettings();
    const cardInfo = AVAILABLE_CARDS.find(c => c.id === 'time')!;
    const Icon = cardInfo.icon;
    
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cardInfo.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {!isLoaded && <Skeleton className="h-8 w-full" />}
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
  const { links, isLoaded: areLinksLoaded, addLink, updateLink, deleteLink, reorderLinks, addMultipleLinks } = useLinks();
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = React.useState(false);
  const [addShowDialogOpen, setAddShowDialogOpen] = React.useState(false);
  const [addMovieDialogOpen, setAddMovieDialogOpen] = React.useState(false);
  const [showDetailsDialogOpen, setShowDetailsDialogOpen] = React.useState(false);
  const [movieDetailsDialogOpen, setMovieDetailsDialogOpen] = React.useState(false);
  const [customizeDialogOpen, setCustomizeDialogOpen] = React.useState(false);
  const [selectedShowId, setSelectedShowId] = React.useState<number | null>(null);
  const [selectedMovieId, setSelectedMovieId] = React.useState<number | null>(null);

  const [linkToEdit, setLinkToEdit] = React.useState<LinkItem | null>(null);

  const [draggedItem, setDraggedItem] = React.useState<LinkItem | null>(null);
  const [dragOverItem, setDragOverItem] = React.useState<LinkItem | null>(null);

  const { toast } = useToast();
  const { weather, weatherError, isLoading: isWeatherLoading } = useWeather();
  const { financialData, financialError, isLoading: isFinancialLoading } = useFinancialData();
  const { shows } = useShows();
  const { movies } = useMovies();
  const { activeCardIds, isLoaded: areSettingsLoaded } = useDashboardSettings();

  const handleAddClick = () => {
    setLinkToEdit(null);
    setLinkDialogOpen(true);
  };
  
  const handleBatchAddClick = () => {
    setBatchDialogOpen(true);
  };

  const handleEditClick = (link: LinkItem) => {
    setLinkToEdit(link);
    setLinkDialogOpen(true);
  };

  const handleShowDetailsClick = (showId: number) => {
    setSelectedShowId(showId);
    setShowDetailsDialogOpen(true);
  };

  const handleMovieDetailsClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setMovieDetailsDialogOpen(true);
  };

  const handleSaveLink = (data: Omit<LinkItem, 'id'>, id?: string) => {
    if (id) {
      updateLink(id, data);
      toast({ title: "Link Atualizado", description: "Seu link foi atualizado com sucesso." });
    } else {
      addLink(data);
      toast({ title: "Link Adicionado", description: "Seu novo link foi adicionado ao painel." });
    }
  };

  const handleSaveBatchLinks = (links: Omit<LinkItem, 'id'>[]) => {
    addMultipleLinks(links);
    toast({ title: "Links Adicionados", description: `${links.length} novos links foram adicionados ao painel.` });
  };
  
  const handleDeleteLink = (id: string) => {
    deleteLink(id);
    toast({ title: "Link Deletado", description: "O link foi removido do seu painel.", variant: 'destructive' });
  }

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
    reorderLinks(draggedItem.id, targetLink.id, targetLink.group);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const groupedLinks = React.useMemo(() => {
    return links.reduce((acc, link) => {
      const group = link.group || 'Geral';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(link);
      return acc;
    }, {} as Record<string, LinkItem[]>);
  }, [links]);

  const isLoaded = areLinksLoaded && areSettingsLoaded;

  const renderCard = (card: DashboardCardType) => {
    switch (card.id) {
        case 'weather':
            return <InfoCard
                key={card.id}
                title={card.title}
                value={weather ? `${weather.temp}°C` : null}
                icon={card.icon}
                footer={weather ? `Em ${weather.city}` : 'Buscando...'}
                error={weatherError}
                isLoading={isWeatherLoading}
            />
        case 'time':
            return <TimeCard key={card.id} />;
        default: // Financial cards
            const data = financialData[card.id];
            const prefix = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'].includes(card.id) ? 'R$ ' : '';
            const footerMap: { [key: string]: string } = {
                'USD-BRL': 'Comercial',
                'EUR-BRL': 'Comercial',
                'BTC-BRL': 'Cotação',
                '^BVSP': 'Pontos',
                'IXIC': 'Pontos',
                'GSPC': 'Pontos'
            };

            return <InfoCard
                key={card.id}
                title={card.title}
                prefix={prefix}
                value={data?.value}
                change={data?.change}
                isPositive={data?.isPositive}
                icon={card.icon}
                footer={footerMap[card.id]}
                error={financialError}
                isLoading={isFinancialLoading}
            />
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          FluxDash
        </h1>
        <div className="ml-auto flex items-center gap-2">
           <Button onClick={() => setCustomizeDialogOpen(true)} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Customizar
          </Button>
           <Button onClick={() => setAddMovieDialogOpen(true)} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Film className="mr-2 h-4 w-4" />
            Adicionar Filme
          </Button>
           <Button onClick={() => setAddShowDialogOpen(true)} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Tv className="mr-2 h-4 w-4" />
            Adicionar Série
          </Button>
           <Button onClick={handleBatchAddClick} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Layers className="mr-2 h-4 w-4" />
            Adicionar em Lote
          </Button>
          <Button onClick={handleAddClick} className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Link
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-8">
            {!isLoaded ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            ) : (
                AVAILABLE_CARDS
                    .filter(card => activeCardIds.includes(card.id))
                    .map(card => renderCard(card))
            )}
        </div>
        
        {shows.length > 0 && (
          <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Acompanhando Séries</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {shows.map(show => (
                      <NextEpisodeCard key={show.id} show={show} onCardClick={handleShowDetailsClick} />
                  ))}
              </div>
          </div>
        )}
        
        {movies.length > 0 && (
          <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Filmes para Assistir</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} onCardClick={handleMovieDetailsClick} />
                  ))}
              </div>
          </div>
        )}

        {!isLoaded && (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-12 w-1/4 mb-4" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skeleton key={j} className="h-32 w-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
        {isLoaded && links.length > 0 && (
          <Accordion type="multiple" defaultValue={Object.keys(groupedLinks)} className="w-full space-y-4">
            {Object.entries(groupedLinks).map(([group, groupLinks]) => (
              <AccordionItem value={group} key={group} className="border-none">
                <AccordionTrigger className="text-2xl font-bold tracking-tight px-4 py-3 bg-card rounded-lg shadow-sm hover:no-underline">
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
                          onEdit={() => handleEditClick(link)}
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
              <Button className="mt-4" onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Link
              </Button>
            </div>
          </div>
        )}
      </main>

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onSave={handleSaveLink}
        linkToEdit={linkToEdit}
      />
      <BatchLinkDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onSave={handleSaveBatchLinks}
      />
      <AddShowDialog
        open={addShowDialogOpen}
        onOpenChange={setAddShowDialogOpen}
      />
      <AddMovieDialog
        open={addMovieDialogOpen}
        onOpenChange={setAddMovieDialogOpen}
      />
      <CustomizeDashboardDialog
        open={customizeDialogOpen}
        onOpenChange={setCustomizeDialogOpen}
      />
      {selectedShowId && (
        <ShowDetailsDialog
            open={showDetailsDialogOpen}
            onOpenChange={setShowDetailsDialogOpen}
            showId={selectedShowId}
        />
      )}
       {selectedMovieId && (
        <MovieDetailsDialog
            open={movieDetailsDialogOpen}
            onOpenChange={setMovieDetailsDialogOpen}
            movieId={selectedMovieId}
        />
      )}
    </div>
  );
}
