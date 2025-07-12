'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WatchedEpisode } from '@/types';

interface WatchedHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: { showName: string; episodes: WatchedEpisode[] } | null;
}

export function WatchedHistoryDialog({ open, onOpenChange, history }: WatchedHistoryDialogProps) {
    const sortedEpisodes = React.useMemo(() => {
        if (!history?.episodes) return [];
        return [...history.episodes].sort((a, b) => parseISO(b.watchedAt).getTime() - parseISO(a.watchedAt).getTime());
    }, [history]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de {history?.showName}</DialogTitle>
          <DialogDescription>
            Aqui estão os episódios que você marcou como assistidos.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-80 border rounded-md">
          {sortedEpisodes.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold">Episódio</TableHead>
                        <TableHead className="text-right font-bold">Assistido em</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEpisodes.map(({ episodeId, episodeName, watchedAt }) => (
                         <TableRow key={episodeId}>
                            <TableCell className="font-medium">{episodeName}</TableCell>
                            <TableCell className="text-right">{format(parseISO(watchedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
             <div className="text-center text-sm text-muted-foreground py-10">
                Nenhum episódio assistido ainda.
              </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
