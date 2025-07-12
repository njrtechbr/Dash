'use client';

import * as React from 'react';
import { Plus, GripVertical, Layers, DollarSign, Thermometer, Calendar, Clock, TrendingUp, CandlestickChart, Bitcoin, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinks } from '@/hooks/use-links';
import { LinkCard } from './link-card';
import { LinkDialog } from './link-dialog';
import { BatchLinkDialog } from './batch-link-dialog';
import type { LinkItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeather } from '@/hooks/use-weather';
import { useFinancialData } from '@/hooks/use-financial-data';
import { useTime } from '@/hooks/use-time';

const InfoCard = ({ title, value, icon: Icon, footer, error, isLoading }: { title: string; value?: string | null; icon: React.ElementType, footer: string, error?: string | null, isLoading: boolean }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading && <Skeleton className="h-8 w-24" />}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {value && !isLoading && !error && <div className="text-2xl font-bold">{value}</div>}
            <p className="text-xs text-muted-foreground">{footer}</p>
        </CardContent>
    </Card>
);

export default function Dashboard() {
  const { links, isLoaded, addLink, updateLink, deleteLink, reorderLinks, addMultipleLinks } = useLinks();
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = React.useState(false);
  const [linkToEdit, setLinkToEdit] = React.useState<LinkItem | null>(null);

  const [draggedItem, setDraggedItem] = React.useState<LinkItem | null>(null);
  const [dragOverItem, setDragOverItem] = React.useState<LinkItem | null>(null);

  const { toast } = useToast();
  const { weather, weatherError, isLoading: isWeatherLoading } = useWeather();
  const { financialData, financialError, isLoading: isFinancialLoading } = useFinancialData(['USD-BRL', 'EUR-BRL', 'BTC-BRL', 'IBOV']);
  const { time, date } = useTime();

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
        <h1 className="text-xl font-bold tracking-tight text-primary">FluxDash</h1>
        <div className="ml-auto flex items-center gap-2">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
            <InfoCard 
                title="Dólar (USD)"
                value={financialData.USDBRL ? `R$ ${financialData.USDBRL.value}` : null}
                icon={DollarSign}
                footer="Cotação de compra"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard 
                title="Euro (EUR)"
                value={financialData.EURBRL ? `R$ ${financialData.EURBRL.value}` : null}
                icon={Euro}
                footer="Cotação de compra"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard 
                title="Bitcoin (BTC)"
                value={financialData.BTCBRL ? `R$ ${financialData.BTCBRL.value}` : null}
                icon={Bitcoin}
                footer="Cotação de compra"
                error={financialError}
                isLoading={isFinancialLoading}
            />
             <InfoCard 
                title="Ibovespa"
                value={financialData.IBOV ? `${financialData.IBOV.value}%` : null}
                icon={TrendingUp}
                footer="Variação do dia"
                error={financialError}
                isLoading={isFinancialLoading}
            />
            <InfoCard
                title="Clima"
                value={weather ? `${weather.temp}°C` : null}
                icon={Thermometer}
                footer={weather ? `Em ${weather.city}` : 'Condição do tempo local'}
                error={weatherError}
                isLoading={isWeatherLoading}
            />
            <Card className="shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2 lg:col-span-3 xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data & Hora</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     {isWeatherLoading && <Skeleton className="h-8 w-full" />}
                     {!isWeatherLoading && (
                        <div className="flex items-baseline justify-between">
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
        </div>


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
        {isLoaded && links.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm mt-16 bg-card/50">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className='p-4 bg-primary/10 rounded-full'>
                <GripVertical className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Seu painel está vazio
              </h3>
              <p className="text-sm text-muted-foreground">
                Adicione seus sistemas web favoritos para começar.
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
    </div>
  );
}
