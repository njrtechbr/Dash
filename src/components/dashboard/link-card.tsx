'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { findIcon } from '@/lib/icons';
import type { LinkItem } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface LinkCardProps {
  link: LinkItem;
  onEdit: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function LinkCard({ link, onEdit, onDelete, isDragging, isDragOver }: LinkCardProps) {
  const Icon = findIcon(link.icon);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block transition-all duration-300',
        isDragging && 'opacity-30 scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg'
      )}
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <Card
        className={cn(
            'h-36 w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:-translate-y-1 hover:border-primary/50',
            isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105',
            'bg-card shadow-md hover:shadow-primary/20 flex flex-col'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center flex-grow">
          <div className="p-3 bg-primary/10 rounded-full transition-colors duration-300 group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-semibold text-foreground truncate w-full px-2">{link.title}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{link.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
        {link.description && (
            <div className="px-3 pb-3 text-center">
                 <p className="text-xs text-muted-foreground truncate">{link.description}</p>
            </div>
        )}
      </Card>
      <div className="absolute top-2 right-2" onClick={handleMenuClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </a>
  );
}
