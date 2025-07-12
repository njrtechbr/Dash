'use client';

import * as React from 'react';
import { Plus, GripVertical, Layers, DollarSign, Thermometer, Calendar, Clock, Bitcoin, Euro, TrendingUp, ArrowUp, ArrowDown, Activity, Landmark, Globe, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinks } from '@/hooks/use-links';
import { LinkCard } from './link-card';
import { LinkDialog } from './link-dialog';
import { BatchLinkDialog } from './batch-link-dialog';
import type { LinkItem } from '@/types';
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

export default function Dashboard() {
  const { links, isLoaded, addLink, updateLink, deleteLink, reorderLinks, addMultipleLinks } = useLinks();
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = React.useState(false);
  const [showDialogOpen, setShowDialogOpen] = React.useState(false);
  const [linkToEdit, setLinkToEdit] = React.useState<LinkItem | null>(null);

  const [draggedItem, setDraggedItem] = React.useState<LinkItem | null>(null);
  const [dragOverItem, setDragOverItem] = React.useState<LinkItem | null>(null);

  const { toast } = useToast();
  const { weather, weatherError, isLoading: isWeatherLoading } = useWeather();
  const { financialData, financialError, isLoading: isFinancialLoading } = useFinancialData();
  const { time, date } = useTime();
  const { shows } = useShows();

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          FluxDash
        </h1>
        <div className="ml-auto flex items-center gap-2">
           <Button onClick={() => setShowDialogOpen(true)} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
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
            <InfoCard 
                title="Dólar"
                prefix="R$ "
                value={financialData['USD-BRL']?.value}
                change={financialData['USD-BRL']?.change}
                isPositive={financialData['USD-BRL']?.isPositive}
                icon={DollarSign}
                footer="Comercial"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard 
                title="Euro"
                prefix="R$ "
                value={financialData['EUR-BRL']?.value}
                change={financialData['EUR-BRL']?.change}
                isPositive={financialData['EUR-BRL']?.isPositive}
                icon={Euro}
                footer="Comercial"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard 
                title="Bitcoin"
                prefix="R$ "
                value={financialData['BTC-BRL']?.value}
                change={financialData['BTC-BRL']?.change}
                isPositive={financialData['BTC-BRL']?.isPositive}
                icon={Bitcoin}
                footer="Cotação"
                error={financialError}
                isLoading={isFinancialLoading}
            />
             <InfoCard
                title="Ibovespa"
                value={financialData['^BVSP']?.value}
                change={financialData['^BVSP']?.change}
                isPositive={financialData['^BVSP']?.isPositive}
                icon={Landmark}
                footer="Pontos"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard
                title="Clima"
                value={weather ? `${weather.temp}°C` : null}
                icon={Thermometer}
                footer={weather ? `Em ${weather.city}` : 'Buscando...'}
                error={weatherError}
                isLoading={isWeatherLoading}
            />
             <Card className="shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data & Hora</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {isWeatherLoading && <Skeleton className="h-8 w-full" />}
                     {!isWeatherLoading && (
                        <div className="flex items-baseline justify-between flex-wrap gap-2">
                             <div className="text-2xl font-bold">{date}</div>
                             <div className="text-2xl font-mono font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground"/>
                                {time}
                             </div>
                        </div>
                     )}
                    <p className="text-xs text-muted-foreground">Fuso horário local</p>
                </CardContent>
            </Card>
            <InfoCard
                title="NASDAQ"
                value={financialData['IXIC']?.value}
                change={financialData['IXIC']?.change}
                isPositive={financialData['IXIC']?.isPositive}
                icon={Activity}
                footer="Pontos"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard
                title="S&P 500"
                value={financialData['GSPC']?.value}
                change={financialData['GSPC']?.change}
                isPositive={financialData['GSPC']?.isPositive}
                icon={Globe}
                footer="Pontos"
                error={financialError}
                isLoading={isFinancialLoading}
            />
        </div>
        
        {shows.length > 0 && (
          <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Próximos Episódios</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {shows.map(show => (
                      <NextEpisodeCard key={show.id} showId={show.id} />
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
        {isLoaded && links.length === 0 && shows.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm mt-16 bg-card/50">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className='p-4 bg-primary/10 rounded-full'>
                <GripVertical className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Seu painel está vazio
              </h3>
              <p className="text-sm text-muted-foreground">
                Adicione seus sistemas web favoritos ou séries para começar.
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
        open={showDialogOpen}
        onOpenChange={setShowDialogOpen}
      />
    </div>
  );
}
